import { Box } from "lucide-react";

export default function Brand() {
  return <a className="montage-brand" href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/`} aria-label="Leroy Merlin Labs, Montaje de N, inicio"><span className="brand-symbol" aria-hidden="true"><Box size={24} strokeWidth={1.5}/></span><span className="brand-copy"><strong>Leroy Merlin <span>Labs</span></strong><small>Montaje de N</small></span></a>;
}
