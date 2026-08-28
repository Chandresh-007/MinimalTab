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
      ? { horizonColor: "#121212", waveColor: "#1c1c1c", crestColor: "#3a3a3a" }
      : { horizonColor: "#edede9", waveColor: "#d6ccc2", crestColor: "#e3d5ca" };

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
        opacity={dark || boss ? 0.85 : 0.9}
        mouseInteraction
        parallaxStrength={0.5}
        grain
        grainIntensity={0.03}
      />
    </div>
  );
}
