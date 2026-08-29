import { useCallback, useEffect, useRef, useState } from "react";
import GradientWaves from "./GradientWaves";
import { StaticBackground } from "./StaticBackground";

const LOW_FPS = 20;
const LOW_FPS_STREAK = 4;

function detectWebGL() {
  if (typeof window === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

function WaveBackground({ dark, boss, debug }) {
  const [status, setStatus] = useState({ running: false, fps: 0 });
  const [fallback, setFallback] = useState(null);
  const streak = useRef(0);

  useEffect(() => {
    if (!detectWebGL()) setFallback("webgl-unsupported");
  }, []);

  const handleStatus = useCallback((s) => {
    setStatus(s);
    if (s?.error) {
      setFallback("init-error");
      return;
    }
    if (s?.running && typeof s.fps === "number" && s.fps > 0) {
      streak.current = s.fps < LOW_FPS ? streak.current + 1 : 0;
      if (streak.current >= LOW_FPS_STREAK) setFallback("low-fps");
    }
  }, []);

  const palette = boss ? { horizonColor: "#000000", waveColor: "#14213d", crestColor: "#fca311" } : dark ? { horizonColor: "#1a0b3d", waveColor: "#7c3aed", crestColor: "#f5f3ff" } : { horizonColor: "#5227FF", waveColor: "#FF9FFC", crestColor: "#FFFFFF" };

  return <>
      {fallback ? <StaticBackground palette={palette} /> : <div
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
    zoom={1}
    height={5.5}
    fogDepth={15}
    detail="medium"
    brightness={boss ? 1.1 : 1}
    opacity={dark || boss ? 0.95 : 1}
    mouseInteraction
    parallaxStrength={0.5}
    grain
    grainIntensity={0.03}
    onStatus={handleStatus}
  />
      </div>}
      {debug ? <div className="pointer-events-none fixed bottom-3 right-3 z-50 rounded-md border border-border bg-background/85 px-2 py-1 font-mono text-[10px] text-muted-foreground backdrop-blur">
          waves:{" "}
          {fallback ? `static fallback — ${fallback}` : status.error ? `error — ${status.error}` : status.running ? `running · ${status.fps} fps` : "idle"}
        </div> : null}
    </>;
}
export {
  WaveBackground
};
