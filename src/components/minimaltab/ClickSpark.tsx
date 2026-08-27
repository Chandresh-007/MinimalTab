import { useRef, useEffect, useCallback, useState } from "react";

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
  color: string;
  size: number;
  radius: number;
}

/** Declarative trigger definition — add new spark targets without touching logic. */
export interface SparkTrigger {
  /** CSS selector matched with `closest()` against the event target. */
  selector: string;
  /** Relative intensity (1 = base). Scales spark count, size and radius. */
  intensity?: number;
  /** Optional color override for this trigger. */
  color?: string;
  /** Optional per-trigger throttle in ms. */
  throttleMs?: number;
}

export interface ClickSparkConfig {
  triggers: SparkTrigger[];
  /** Fallback when no trigger matches: "none" (default) ignores the event. */
  fallback?: "none" | "base";
}

interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
  extraScale?: number;
  /** Declarative trigger config. Falls back to a sensible default set. */
  config?: ClickSparkConfig;
  /** Minimum ms between two spark bursts. */
  throttleMs?: number;
  /** Visualize trigger hit points and per-frame render cost. */
  debug?: boolean;
  children: React.ReactNode;
}

const DEFAULT_CONFIG: ClickSparkConfig = {
  triggers: [
    { selector: "[data-spark]", intensity: 1.25 },
    { selector: "button, [role='button'], input[type='submit']", intensity: 1 },
    { selector: "a[href]", intensity: 0.8 },
  ],
  fallback: "none",
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function ClickSpark({
  sparkColor = "#fff",
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = "ease-out",
  extraScale = 1.0,
  config = DEFAULT_CONFIG,
  throttleMs = 120,
  debug = false,
  children,
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastSparkRef = useRef(0);
  const frameCostRef = useRef(0);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({ sparks: 0, ms: 0, bursts: 0 });
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Adaptive budget: fewer cores / less memory / coarse pointers get lighter bursts.
  const [tier, setTier] = useState(1);
  useEffect(() => {
    const nav = navigator as Navigator & { hardwareConcurrency?: number; deviceMemory?: number };
    const cores = nav.hardwareConcurrency ?? 8;
    const mem = nav.deviceMemory ?? 8;
    let t = 1;
    if (cores <= 4 || mem <= 4) t = 0.6;
    if (cores <= 2 || mem <= 2) t = 0.4;
    setTier(t);
  }, []);

  const lowPower = tier < 1;
  const active = mounted && !reduced;

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    let resizeTimeout: ReturnType<typeof setTimeout>;

    const resizeCanvas = () => {
      const { width, height } = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 2);
      const w = Math.floor(width * dpr);
      const h = Math.floor(height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(parent);
    resizeCanvas();

    return () => {
      ro.disconnect();
      clearTimeout(resizeTimeout);
    };
  }, [active, lowPower]);

  const easeFunc = useCallback(
    (t: number) => {
      switch (easing) {
        case "linear":
          return t;
        case "ease-in":
          return t * t;
        case "ease-in-out":
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        default:
          return t * (2 - t);
      }
    },
    [easing],
  );

  // The render loop only runs while sparks exist — idle pages cost zero frames.
  const ensureLoop = useCallback(() => {
    if (rafRef.current !== null) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const draw = (timestamp: number) => {
      const t0 = debug ? performance.now() : 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";

      // Group by color so each color is one batched path.
      const byColor = new Map<string, Spark[]>();
      sparksRef.current = sparksRef.current.filter((spark) => {
        if (timestamp - spark.startTime >= duration) return false;
        const bucket = byColor.get(spark.color);
        if (bucket) bucket.push(spark);
        else byColor.set(spark.color, [spark]);
        return true;
      });

      byColor.forEach((list, color) => {
        ctx.strokeStyle = color;
        ctx.beginPath();
        for (const spark of list) {
          const eased = easeFunc((timestamp - spark.startTime) / duration);
          const distance = eased * spark.radius * extraScale;
          const lineLength = spark.size * (1 - eased);
          const cos = Math.cos(spark.angle);
          const sin = Math.sin(spark.angle);
          ctx.moveTo(spark.x + distance * cos, spark.y + distance * sin);
          ctx.lineTo(
            spark.x + (distance + lineLength) * cos,
            spark.y + (distance + lineLength) * sin,
          );
        }
        ctx.stroke();
      });

      if (debug) {
        frameCostRef.current = performance.now() - t0;
        setStats((s) => ({
          sparks: sparksRef.current.length,
          ms: Math.round(frameCostRef.current * 100) / 100,
          bursts: s.bursts,
        }));
      }

      if (sparksRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(draw);
  }, [debug, duration, easeFunc, extraScale]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  const matchTrigger = useCallback(
    (target: HTMLElement | null): SparkTrigger | null => {
      if (!target) return config.fallback === "base" ? { selector: "*" } : null;
      for (const trigger of config.triggers) {
        if (target.closest(trigger.selector)) return trigger;
      }
      return config.fallback === "base" ? { selector: "*" } : null;
    },
    [config],
  );

  const burst = useCallback(
    (x: number, y: number, trigger: SparkTrigger) => {
      const now = performance.now();
      const gate = trigger.throttleMs ?? throttleMs;
      if (now - lastSparkRef.current < gate) return;
      lastSparkRef.current = now;

      const intensity = (trigger.intensity ?? 1) * tier;
      const count = Math.max(4, Math.round(sparkCount * intensity));
      const color = trigger.color ?? sparkColor;
      const size = sparkSize * Math.max(0.6, intensity);
      const radius = sparkRadius * Math.max(0.6, intensity);

      for (let i = 0; i < count; i++) {
        sparksRef.current.push({
          x,
          y,
          angle: (2 * Math.PI * i) / count,
          startTime: now,
          color,
          size,
          radius,
        });
      }
      if (debug) setStats((s) => ({ ...s, bursts: s.bursts + 1 }));
      ensureLoop();
    },
    [debug, ensureLoop, sparkColor, sparkCount, sparkRadius, sparkSize, throttleMs, tier],
  );

  // Pointer events cover mouse, pen and touch with the same coordinates and
  // without blocking scrolling (no preventDefault).
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!active) return;
      const trigger = matchTrigger(e.target as HTMLElement | null);
      if (!trigger) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      burst(e.clientX - rect.left, e.clientY - rect.top, trigger);
    },
    [active, burst, matchTrigger],
  );

  // Keyboard activation: only Enter / Space on a focused trigger, centred on it.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!active) return;
      if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return;
      if (e.repeat) return;
      const el = e.target as HTMLElement | null;
      if (!el) return;
      // Ignore typing in fields (Enter in a search input is handled by submit buttons).
      if (el.tagName === "TEXTAREA" || (el.tagName === "INPUT" && el.getAttribute("type") !== "submit")) return;
      const trigger = matchTrigger(el);
      if (!trigger) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const box = el.getBoundingClientRect();
      burst(box.left + box.width / 2 - rect.left, box.top + box.height / 2 - rect.top, trigger);
    },
    [active, burst, matchTrigger],
  );

  if (mounted && reduced) {
    return <>{children}</>;
  }

  return (
    <div
      style={{ position: "relative", width: "100%", minHeight: "100%", touchAction: "manipulation" }}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      data-spark-debug={debug ? "on" : undefined}
    >
      {active && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            userSelect: "none",
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
          }}
        />
      )}
      {children}
      {active && debug && (
        <div className="pointer-events-none fixed bottom-3 left-3 z-50 rounded-md border border-border bg-card/90 px-2 py-1 font-mono text-[10px] text-muted-foreground backdrop-blur">
          sparks {stats.sparks} · {stats.ms}ms/frame · bursts {stats.bursts} · tier {tier}
        </div>
      )}
    </div>
  );
}
