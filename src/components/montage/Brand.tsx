import { Box } from "lucide-react";
import localFont from "next/font/local";

const leroyMerlinSans = localFont({
  src: [
    { path: "../../assets/fonts/leroy-merlin/LeroyMerlinSans-Web-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../assets/fonts/leroy-merlin/LeroyMerlinSans-Web-Bold.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
});

export default function Brand() {
  return <a className="montage-brand" href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/`} aria-label="Leroy Merlin Labs, Montaje de N, inicio"><span className="brand-symbol" aria-hidden="true"><Box size={24} strokeWidth={1.5}/></span><span className={`brand-copy ${leroyMerlinSans.className}`}><strong><span className="brand-name">Leroy Merlin</span><span className="brand-labs">Labs</span></strong><small>Montaje de N</small></span></a>;
}
