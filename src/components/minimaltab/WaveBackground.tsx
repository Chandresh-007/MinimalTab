import { useEffect, useRef } from "react";

/**
 * Full-viewport ambient background: a field of dots arranged on a grid
 * that gently ripples like a wave, combined with slow twinkling stars.
 * Colors adapt to light/dark theme by reading the foreground CSS variable.
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
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let start = performance.now();

    type Star = { x: number; y: number; r: number; phase: number; speed: number };
    let stars: Star[] = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Regenerate stars proportional to viewport area.
      const count = Math.round((width * height) / 9000);
      stars = new Array(count).fill(0).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.1 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 1.4,
      }));
    };

    const isDark = () => document.documentElement.classList.contains("dark");

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);

      const dark = isDark();
      const dotColor = dark ? "255,255,255" : "15,23,42";
      const starColor = dark ? "255,255,255" : "30,41,59";

      // Wavy dot grid.
      const spacing = 34;
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      const amp = 6;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const bx = i * spacing;
          const by = j * spacing;
          const wave =
            Math.sin((bx + t * 40) * 0.012 + j * 0.35) +
            Math.cos((by + t * 30) * 0.014 + i * 0.28);
          const dx = bx + Math.cos(wave) * amp;
          const dy = by + Math.sin(wave) * amp;
          const alpha = dark ? 0.18 + 0.12 * Math.sin(wave + t) : 0.1 + 0.08 * Math.sin(wave + t);
          ctx.fillStyle = `rgba(${dotColor},${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(dx, dy, 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Twinkling stars.
      for (const s of stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
        const alpha = (dark ? 0.75 : 0.35) * twinkle;
        ctx.fillStyle = `rgba(${starColor},${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Soft radial glow behind the canvas for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.foreground/6),transparent_60%)] opacity-70" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
