import { useEffect, useState } from "react";

import Silk from "./Silk";

/**
 * Full-viewport ambient Silk background with separate
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

  const palette = dark
    ? { color: "#3a3550", opacity: 0.75 }
    : { color: "#d5bdaf", opacity: 0.85 };

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <Silk
        speed={7.1}
        scale={1.2}
        color={palette.color}
        noiseIntensity={0.3}
        rotation={0}
        opacity={palette.opacity}
      />
    </div>
  );
}
