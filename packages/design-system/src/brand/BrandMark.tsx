import brandMarkSource from "./promimi.png";

export function BrandMark({ className = "", label = "Promimi" }: { className?: string; label?: string }) {
  return <img className={`rounded-[22%] object-cover ${className}`} src={brandMarkSource} alt={label} />;
}
