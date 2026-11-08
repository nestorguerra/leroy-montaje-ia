export const DEMO_SESSION = "leroy-montaje-ia:demo-session:v1";
export const SAVED_API_KEY = "leroy-montaje-ia:openai-key:v1";
type BrowserStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function demoCredentialsMatch(username: string, password: string) {
  return username.trim().toLowerCase() === "demo" && password === "demo";
}

export function browserStorage(kind: "localStorage" | "sessionStorage"): BrowserStorage | null {
  try { return typeof window === "undefined" ? null : window[kind]; }
  catch { return null; }
}

export function hasDemoSession(storage: BrowserStorage | null) {
  try { return storage?.getItem(DEMO_SESSION) === "demo"; }
  catch { return false; }
}

export function saveDemoSession(storage: BrowserStorage | null, signedIn: boolean) {
  try {
    if (signedIn) storage?.setItem(DEMO_SESSION, "demo");
    else storage?.removeItem(DEMO_SESSION);
  } catch { /* A blocked session store still allows an in-memory demo session. */ }
}

export function apiKeyHasValidFormat(key: string) {
  return key.startsWith("sk-") && key.length > 12 && !/\s/.test(key);
}

export function loadSavedApiKey(storage: BrowserStorage | null) {
  try {
    const value = storage?.getItem(SAVED_API_KEY);
    if (!value) return "";
    const record = JSON.parse(value);
    return record?.version === 1 && typeof record.key === "string" && apiKeyHasValidFormat(record.key) ? record.key : "";
  } catch { return ""; }
}

export function updateSavedApiKey(storage: BrowserStorage | null, key: string, remember: boolean, wasSaved = false) {
  if (remember && !apiKeyHasValidFormat(key)) throw new Error("Revisa el formato de la API Key.");
  try {
    if (!storage) throw new Error("Storage unavailable");
    if (remember) storage.setItem(SAVED_API_KEY, JSON.stringify({ version: 1, key }));
    else storage.removeItem(SAVED_API_KEY);
  } catch {
    if (remember) throw new Error("Este navegador no permite guardar la clave. Desmarca la opción para usarla solo en esta sesión.");
    if (wasSaved) throw new Error("No se ha podido borrar la clave guardada. Revisa los permisos de almacenamiento del navegador y vuelve a intentarlo.");
  }
}
