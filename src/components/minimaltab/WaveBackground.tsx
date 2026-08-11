import { useEffect, useState } from "react";

import GradientWaves from "./GradientWaves";

/**
 * Full-viewport ambient gradient-wave background with separate
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
    ? { horizonColor: "#121212", waveColor: "#3B3B57", crestColor: "#E0E0E0", brightness: 1, opacity: 0.9 }
    : { horizonColor: "#f5ebe0", waveColor: "#d6ccc2", crestColor: "#ffffff", brightness: 1.02, opacity: 0.85 };

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <GradientWaves
        horizonColor={palette.horizonColor}
        waveColor={palette.waveColor}
        crestColor={palette.crestColor}
        speed={0.4}
        amplitude={2.5}
        waveScale={0.6}
        waveRatio={0.9}
        swell={35}
        turbulence={20}
        tilt={1.11}
        zoom={1}
        height={5.5}
        fogDepth={15}
        detail="medium"
        brightness={palette.brightness}
        opacity={palette.opacity}
        mouseInteraction
        parallaxStrength={0.5}
        grain
        grainIntensity={0.05}
      />
    </div>
  );
}
