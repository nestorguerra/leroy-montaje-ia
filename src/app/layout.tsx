import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leroy Merlin Labs | Montaje de N",
  description: "Arrastra el PDF de tu manual. Explora el producto y sus piezas en 3D, gira el modelo y sigue el montaje paso a paso. Con OpenAI y el motor 3D de Bygga.",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const csp = ["default-src 'self'", "script-src 'self' 'unsafe-inline'", "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob:", "font-src 'self'", "connect-src 'self' https://api.openai.com", "media-src 'self' blob:", "worker-src 'self' blob:", "object-src 'none'", "base-uri 'self'", "form-action 'none'"].join("; ");
  return <html lang="es"><head><meta httpEquiv="Content-Security-Policy" content={csp}/><meta name="referrer" content="no-referrer"/></head><body>{children}</body></html>;
}
