import { Coffee } from "lucide-react";

/**
 * Custom Buy Me a Coffee button anchored to the top-right corner.
 * Rendered as a plain link so we control sizing, spacing, and z-index —
 * the upstream script auto-injects a bottom-right button that overlaps
 * content on small screens.
 */
export function BuyMeCoffee() {
  return (
    <a
      href="https://www.buymeacoffee.com/chandresh_p"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Buy me a coffee"
      className="fixed right-3 top-3 z-[100] inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-[#FFDD00] px-2.5 py-1.5 text-[11px] font-semibold text-black shadow-md transition-transform hover:scale-105 hover:shadow-lg sm:right-4 sm:top-4 sm:px-3 sm:py-2 sm:text-xs"
      style={{ fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif" }}
    >
      <Coffee className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
      <span className="hidden xs:inline sm:inline">Buy me a coffee</span>
      <span className="xs:hidden sm:hidden">Coffee</span>
    </a>
  );
}
