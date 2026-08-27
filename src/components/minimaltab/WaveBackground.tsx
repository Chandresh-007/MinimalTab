import { useEffect, useState } from "react";

import Topography from "./Topography";

/**
 * Full-viewport ambient topographic contour background with separate
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
    ? {
        lowColor: "#3A29FF",
        midColor: "#B497CF",
        highColor: "#FFFFFF",
        opacity: 0.55,
        brightness: 1.0,
      }
    : {
        lowColor: "#d5bdaf",
        midColor: "#d6ccc2",
        highColor: "#8a7968",
        opacity: 0.75,
        brightness: 0.95,
      };

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <Topography
        lowColor={palette.lowColor}
        midColor={palette.midColor}
        highColor={palette.highColor}
        speed={0.35}
        morphAmount={3.0}
        morphSpeed={0.05}
        bands={2.0}
        thickness={0.01}
        scale={1.0}
        glow={0.5}
        colorMode="elevation"
        contrast={3.0}
        brightness={palette.brightness}
        opacity={palette.opacity}
        grain
        grainIntensity={0.04}
        mouseInteraction
        mouseRadius={0.3}
        mouseStrength={0.4}
      />
    </div>
  );
}
