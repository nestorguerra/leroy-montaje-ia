export type OpenAIResponse = {
  status?: string;
  output?: { content?: { type: string; text?: string }[] }[];
  usage?: { input_tokens: number; output_tokens: number };
};

const interrupted = "La conexión con OpenAI se ha interrumpido antes de recibir la guía completa. No se ha reintentado automáticamente.";

// Only a terminal response is accepted. Text deltas can contain partial JSON.
export async function readOpenAIResponse(response: Response, signal: AbortSignal): Promise<OpenAIResponse> {
  if (!response.headers.get("content-type")?.includes("text/event-stream")) return response.json();
  if (!response.body) throw new Error(interrupted);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = "";
  const cancel = () => { void reader.cancel().catch(() => {}); };
  signal.addEventListener("abort", cancel, { once: true });
  const event = (frame: string): OpenAIResponse | undefined => {
    const data = frame.split(/\r?\n/).filter(line => line.startsWith("data:")).map(line => line.slice(5).trimStart()).join("\n");
    if (!data || data === "[DONE]") return;
    let value: { type?: string; response?: OpenAIResponse };
    try { value = JSON.parse(data); } catch { throw new Error(interrupted); }
    if (value.type === "error") throw new Error("OpenAI ha interrumpido la generación. No se ha reintentado automáticamente.");
    if (["response.completed", "response.incomplete", "response.failed"].includes(value.type ?? "")) {
      if (!value.response) throw new Error(interrupted);
      return value.response;
    }
  };
  try {
    while (true) {
      signal.throwIfAborted();
      const { value, done } = await reader.read();
      signal.throwIfAborted();
      pending += decoder.decode(value, { stream: !done });
      if (pending.length > 4 * 1024 * 1024) throw new Error("OpenAI ha enviado una respuesta demasiado grande.");
      let separator: RegExpExecArray | null;
      while ((separator = /\r?\n\r?\n/.exec(pending))) {
        const frame = pending.slice(0, separator.index);
        pending = pending.slice(separator.index + separator[0].length);
        const result = event(frame);
        if (result) return result;
      }
      if (done) {
        const result = event(pending);
        if (result) return result;
        throw new Error(interrupted);
      }
    }
  } catch (error) {
    signal.throwIfAborted();
    if (error instanceof TypeError) throw new Error(interrupted);
    throw error;
  } finally {
    signal.removeEventListener("abort", cancel);
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
