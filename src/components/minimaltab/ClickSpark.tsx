import { useRef, useEffect, useCallback, useState } from "react";

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out";
  extraScale?: number;
  /** Only pointer events landing inside an element matching this selector spark. */
  triggerSelector?: string;
  /** Minimum ms between two spark bursts. */
  throttleMs?: number;
  children: React.ReactNode;
}

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
  triggerSelector = "[data-spark], button, a, [role='button'], input[type='submit']",
  throttleMs = 120,
  children,
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastSparkRef = useRef(0);
  const [mounted, setMounted] = useState(false);
  const reduced = usePrefersReducedMotion();

  // Low-end devices get fewer sparks.
  const lowPower =
    mounted &&
    ((navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency ?? 8) <= 4;
  const effectiveCount = Math.max(4, lowPower ? Math.round(sparkCount / 2) : sparkCount);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = sparkColor;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) return false;

        const eased = easeFunc(elapsed / duration);
        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);
        const cos = Math.cos(spark.angle);
        const sin = Math.sin(spark.angle);

        ctx.moveTo(spark.x + distance * cos, spark.y + distance * sin);
        ctx.lineTo(spark.x + (distance + lineLength) * cos, spark.y + (distance + lineLength) * sin);
        return true;
      });

      ctx.stroke();

      if (sparksRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(draw);
  }, [duration, easeFunc, extraScale, sparkColor, sparkRadius, sparkSize]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  // Pointer events cover mouse, pen and touch with the same coordinates and
  // without blocking scrolling (passive listener, no preventDefault).
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!active) return;
      const target = e.target as HTMLElement | null;
      if (triggerSelector && !target?.closest(triggerSelector)) return;

      const now = performance.now();
      if (now - lastSparkRef.current < throttleMs) return;
      lastSparkRef.current = now;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (let i = 0; i < effectiveCount; i++) {
        sparksRef.current.push({
          x,
          y,
          angle: (2 * Math.PI * i) / effectiveCount,
          startTime: now,
        });
      }
      ensureLoop();
    },
    [active, effectiveCount, ensureLoop, throttleMs, triggerSelector],
  );

  if (mounted && reduced) {
    return <>{children}</>;
  }

  return (
    <div
      style={{ position: "relative", width: "100%", minHeight: "100%", touchAction: "manipulation" }}
      onPointerDown={handlePointerDown}
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
    </div>
  );
}
