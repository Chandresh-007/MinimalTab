import { useEffect, useRef } from "react";

/**
 * Full-viewport ambient background: a capability-aware field of wavey dots
 * plus optional twinkles. It automatically lowers particle density on
 * low-power devices and respects reduced-motion preferences.
 */
export function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
    const lowPower = cores <= 4 || memory <= 4;

    let reducedMotion = motionQuery.matches;
    let dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.35 : 1.75);
    let raf = 0;
    let start = performance.now();
    let lastFrame = 0;
    let frameInterval = reducedMotion ? 1000 / 12 : lowPower ? 1000 / 30 : 1000 / 60;

    type Star = { x: number; y: number; r: number; phase: number; speed: number };
    let stars: Star[] = [];
    let grid: { x: number; y: number; row: number; col: number }[] = [];

    const getProfile = () => {
      const area = width * height;
      const compactViewport = area < 520_000;
      const spacing = reducedMotion ? 46 : lowPower || compactViewport ? 40 : 32;
      return {
        spacing,
        amplitude: reducedMotion ? 1.4 : lowPower ? 3.5 : 5.5,
        speed: reducedMotion ? 0.16 : lowPower ? 0.55 : 1,
        starCount: reducedMotion ? 0 : Math.min(lowPower ? 52 : 120, Math.round(area / (lowPower ? 18_000 : 11_000))),
      };
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1.35 : 1.75);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const { spacing, starCount } = getProfile();
      const cols = Math.ceil(width / spacing) + 2;
      const rows = Math.ceil(height / spacing) + 2;
      grid = [];
      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          grid.push({ x: col * spacing - spacing / 2, y: row * spacing - spacing / 2, row, col });
        }
      }

      stars = new Array(starCount).fill(0).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.1 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.28 + Math.random() * 0.72,
      }));
    };

    const isDark = () => document.documentElement.classList.contains("dark");

    const draw = (now: number) => {
      if (now - lastFrame < frameInterval) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastFrame = now;

      const { amplitude, speed } = getProfile();
      const t = ((now - start) / 1000) * speed;
      ctx.clearRect(0, 0, width, height);

      const dark = isDark();
      const dotColor = "255,255,255";
      const glowColor = dark ? "102,146,255" : "255,255,255";

      // Soft theme-aware wash so white dots stay visible in both modes.
      const wash = ctx.createRadialGradient(width * 0.5, height * 0.12, 0, width * 0.5, height * 0.12, Math.max(width, height));
      wash.addColorStop(0, dark ? `rgba(${glowColor},0.16)` : `rgba(${glowColor},0.58)`);
      wash.addColorStop(0.52, dark ? "rgba(255,255,255,0.035)" : "rgba(226,232,240,0.22)");
      wash.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, width, height);

      // Wavy dot grid. White in both themes, but opacity adapts for legibility.
      for (const point of grid) {
        const wave =
          Math.sin((point.x + t * 38) * 0.012 + point.row * 0.35) +
          Math.cos((point.y + t * 26) * 0.014 + point.col * 0.28);
        const dx = point.x + Math.cos(wave) * amplitude;
        const dy = point.y + Math.sin(wave) * amplitude;
        const alpha = dark ? 0.16 + 0.12 * Math.sin(wave + t) : 0.32 + 0.13 * Math.sin(wave + t);
        ctx.fillStyle = `rgba(${dotColor},${Math.max(0.04, alpha).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(dx, dy, dark ? 1.05 : 1.25, 0, Math.PI * 2);
        ctx.fill();
      }

      // Twinkling stars. Disabled under reduced motion.
      for (const s of stars) {
        const twinkle = 0.55 + 0.45 * Math.sin(t * s.speed + s.phase);
        const alpha = (dark ? 0.55 : 0.3) * twinkle;
        ctx.fillStyle = `rgba(${dotColor},${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    const updateMotionPreference = () => {
      reducedMotion = motionQuery.matches;
      frameInterval = reducedMotion ? 1000 / 12 : lowPower ? 1000 / 30 : 1000 / 60;
      resize();
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    motionQuery.addEventListener("change", updateMotionPreference);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      motionQuery.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
