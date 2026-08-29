import { Coffee } from "lucide-react";
function BuyMeCoffee() {
  return <div className="relative group">
      <a
    href="https://www.buymeacoffee.com/chandresh_p"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Buy me a coffee"
    title="Buy me a coffee"
    className="inline-flex min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 items-center justify-center gap-1.5 rounded-full border border-black/10 bg-[#FFDD00] px-2.5 py-2 text-[11px] font-semibold text-black shadow-sm transition-transform hover:scale-[1.03] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 sm:px-2.5 sm:py-1.5 sm:text-xs"
    style={{ fontFamily: "Poppins, ui-sans-serif, system-ui, sans-serif" }}
  >
        <Coffee className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Buy me a coffee</span>
      </a>
      {
    /* Tooltip — visible on hover/focus, hidden on sm+ where the label already shows */
  }
      <span
    role="tooltip"
    className="pointer-events-none absolute right-0 top-full mt-1.5 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[10px] font-medium text-background opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 sm:hidden"
  >
        Buy me a coffee
      </span>
    </div>;
}
export {
  BuyMeCoffee
};
