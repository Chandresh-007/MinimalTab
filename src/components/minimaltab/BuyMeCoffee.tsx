import { useEffect } from "react";

/**
 * Injects the Buy Me a Coffee floating button (bottom-right by default).
 * The upstream script auto-appends its own fixed-position button to <body>.
 */
export function BuyMeCoffee() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("bmc-script")) return;

    const script = document.createElement("script");
    script.id = "bmc-script";
    script.type = "text/javascript";
    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js";
    script.setAttribute("data-name", "bmc-button");
    script.setAttribute("data-slug", "chandresh_p");
    script.setAttribute("data-color", "#FFDD00");
    script.setAttribute("data-emoji", "");
    script.setAttribute("data-font", "Poppins");
    script.setAttribute("data-text", "Buy me a coffee");
    script.setAttribute("data-outline-color", "#000000");
    script.setAttribute("data-font-color", "#000000");
    script.setAttribute("data-coffee-color", "#ffffff");
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return null;
}
