import { Coffee } from "lucide-react";

/**
 * Buy Me a Coffee button — inline in the header's top-right cluster so it
 * never overlaps content, and compact on mobile (icon only) to preserve space.
 */
export function BuyMeCoffee() {
  return (
    <a
      href="https://www.buymeacoffee.com/chandresh_p"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Buy me a coffee"
      className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-[#FFDD00] px-2 py-1.5 text-[11px] font-semibold text-black shadow-sm transition-transform hover:scale-[1.03] hover:shadow-md sm:px-2.5 sm:text-xs"
      style={{ fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif" }}
    >
      <Coffee className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
      <span className="hidden sm:inline">Buy me a coffee</span>
    </a>
  );
}
