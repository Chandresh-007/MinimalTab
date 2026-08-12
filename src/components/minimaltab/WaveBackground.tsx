import { useEffect, useState } from "react";

import Aurora from "./Aurora";

/**
 * Full-viewport ambient Aurora background with separate
 * light-mode and dark-mode palettes.
 */
export function WaveBackground() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setDark(root.classList.contains("dark"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const palette: { colorStops: [string, string, string]; blend: number; opacity: number } = dark
    ? { colorStops: ["#3A29FF", "#B497CF", "#5227FF"], blend: 0.5, opacity: 0.7 }
    : { colorStops: ["#d5bdaf", "#e3d5ca", "#d6ccc2"], blend: 0.6, opacity: 0.9 };

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 rotate-180" style={{ opacity: palette.opacity }}>
        <Aurora colorStops={palette.colorStops} blend={palette.blend} amplitude={1.0} speed={0.5} />
      </div>
    </div>
  );
}
