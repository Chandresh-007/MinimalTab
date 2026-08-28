import GradientWaves from "./GradientWaves";

interface WaveBackgroundProps {
  dark?: boolean;
  boss?: boolean;
}

/**
 * Full-viewport GradientWaves background, themed per active palette.
 * PixelSnow remains as the ambient motion layer above this.
 */
export function WaveBackground({ dark, boss }: WaveBackgroundProps) {
  const palette = boss
    ? { horizonColor: "#000000", waveColor: "#14213d", crestColor: "#fca311" }
    : dark
      ? { horizonColor: "#121212", waveColor: "#2a2a2a", crestColor: "#888888" }
      : { horizonColor: "#edede9", waveColor: "#d5bdaf", crestColor: "#f5ebe0" };

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
        opacity={1.0}
        mouseInteraction
        parallaxStrength={0.5}
        grain
        grainIntensity={0.04}
      />
    </div>
  );
}
