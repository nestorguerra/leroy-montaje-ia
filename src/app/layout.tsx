import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Del manual al montaje | Leroy Montaje IA",
  description: "Convierte un manual en una guía animada de montaje con OpenAI. Adaptación independiente de Bygga.",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const csp = ["default-src 'self'", "script-src 'self' 'unsafe-inline'", "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob:", "font-src 'self'", "connect-src 'self' https://api.openai.com", "media-src 'self' blob:", "worker-src 'self' blob:", "object-src 'none'", "base-uri 'self'", "form-action 'none'"].join("; ");
  return <html lang="es"><head><meta httpEquiv="Content-Security-Policy" content={csp}/><meta name="referrer" content="no-referrer"/></head><body>{children}</body></html>;
}
