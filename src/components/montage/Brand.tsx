import Image from "next/image";
import localFont from "next/font/local";
import leroyMerlinLogo from "@/assets/branding/leroy-merlin.jpg";

const leroyMerlinSans = localFont({
  src: [
    { path: "../../assets/fonts/leroy-merlin/LeroyMerlinSans-Web-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../assets/fonts/leroy-merlin/LeroyMerlinSans-Web-Bold.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
});

export default function Brand() {
  return <a className="montage-brand" href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/`} aria-label="Leroy Merlin Labs, Montaje de N, inicio"><Image className="brand-logo" src={leroyMerlinLogo} alt="" aria-hidden="true" preload/><span className={`brand-copy ${leroyMerlinSans.className}`}><strong className="brand-labs">LABS</strong><small>Montaje de N</small></span></a>;
}
