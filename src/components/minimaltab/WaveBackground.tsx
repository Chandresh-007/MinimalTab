import GradientWaves from "./GradientWaves";

interface WaveBackgroundProps {
  dark?: boolean;
  boss?: boolean;
}

/**
 * Full-viewport GradientWaves background, themed per active palette.
 */
export function WaveBackground({ dark, boss }: WaveBackgroundProps) {
  // Vivid React Bits signature palette — clearly visible in both light and
  // dark mode. Boss theme keeps its black/blue/gold identity.
  const palette = boss
    ? { horizonColor: "#000000", waveColor: "#14213d", crestColor: "#fca311" }
    : dark
      ? { horizonColor: "#1a0b3d", waveColor: "#b445c9", crestColor: "#f5f3ff" }
      : { horizonColor: "#5227FF", waveColor: "#FF9FFC", crestColor: "#FFFFFF" };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 bg-background"
    >
      <GradientWaves
        {...palette}
        speed={0.35}
        amplitude={2.5}
        waveScale={0.6}
        waveRatio={0.9}
        swell={35}
        turbulence={20}
        tilt={1.11}
        zoom={1.0}
        height={5.5}
        fogDepth={15}
        detail="medium"
        brightness={boss ? 1.1 : 1.0}
        opacity={dark || boss ? 0.95 : 1.0}
        mouseInteraction
        parallaxStrength={0.5}
        grain
        grainIntensity={0.03}
      />
    </div>
  );
}
