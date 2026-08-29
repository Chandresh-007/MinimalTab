import { useState } from "react";
import GradientWaves from "./GradientWaves";

interface WaveBackgroundProps {
  dark?: boolean;
  boss?: boolean;
  /** Shows a small overlay reporting whether the WebGL loop is running. */
  debug?: boolean;
}

/**
 * Full-viewport GradientWaves background, themed per active palette.
 * Sits behind all content (z-0) and never intercepts pointer events.
 */
export function WaveBackground({ dark, boss, debug }: WaveBackgroundProps) {
  const [status, setStatus] = useState<{ running: boolean; fps: number; error?: string }>({
    running: false,
    fps: 0,
  });

  // Palettes tuned for clear motion contrast against each theme's page bg.
  const palette = boss
    ? { horizonColor: "#000000", waveColor: "#14213d", crestColor: "#fca311" }
    : dark
      ? { horizonColor: "#1a0b3d", waveColor: "#7c3aed", crestColor: "#f5f3ff" }
      : { horizonColor: "#5227FF", waveColor: "#FF9FFC", crestColor: "#FFFFFF" };

  return (
    <>
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
          onStatus={setStatus}
        />
      </div>
      {debug ? (
        <div className="pointer-events-none fixed bottom-3 right-3 z-50 rounded-md border border-border bg-background/85 px-2 py-1 font-mono text-[10px] text-muted-foreground backdrop-blur">
          waves:{" "}
          {status.error
            ? `error — ${status.error}`
            : status.running
              ? `running · ${status.fps} fps`
              : "idle"}
        </div>
      ) : null}
    </>
  );
}
