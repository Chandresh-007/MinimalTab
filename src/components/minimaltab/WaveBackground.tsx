import { motion } from "framer-motion";

/**
 * Animated wavy background that adapts its palette to the active theme.
 * Uses explicit light/dark gradient stops so the transition feels intentional
 * rather than a simple opacity swap.
 */
export function WaveBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Wallpaper gradient layer */}
      <div className="wallpaper-layer absolute inset-0 transition-[background] duration-700" />

      {/* Soft radial glow — theme-aware via Tailwind dark variant */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.foreground/6),transparent_60%)] dark:opacity-100 opacity-60" />

      <svg
        className="absolute inset-x-0 top-0 h-full w-full text-foreground"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wave-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.10" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wave-b" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.08" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wave-c" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.05" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        <motion.path
          fill="url(#wave-a)"
          initial={{ d: "M0,280 C320,400 640,160 960,260 C1240,340 1360,240 1440,280 L1440,900 L0,900 Z" }}
          animate={{
            d: [
              "M0,280 C320,400 640,160 960,260 C1240,340 1360,240 1440,280 L1440,900 L0,900 Z",
              "M0,320 C300,220 660,400 960,320 C1220,250 1360,360 1440,300 L1440,900 L0,900 Z",
              "M0,280 C320,400 640,160 960,260 C1240,340 1360,240 1440,280 L1440,900 L0,900 Z",
            ],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          fill="url(#wave-b)"
          initial={{ d: "M0,480 C260,580 560,400 860,480 C1160,560 1340,440 1440,500 L1440,900 L0,900 Z" }}
          animate={{
            d: [
              "M0,480 C260,580 560,400 860,480 C1160,560 1340,440 1440,500 L1440,900 L0,900 Z",
              "M0,520 C280,420 580,580 880,500 C1160,430 1340,540 1440,480 L1440,900 L0,900 Z",
              "M0,480 C260,580 560,400 860,480 C1160,560 1340,440 1440,500 L1440,900 L0,900 Z",
            ],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          fill="url(#wave-c)"
          initial={{ d: "M0,650 C360,720 720,580 1080,660 C1260,700 1380,620 1440,650 L1440,900 L0,900 Z" }}
          animate={{
            d: [
              "M0,650 C360,720 720,580 1080,660 C1260,700 1380,620 1440,650 L1440,900 L0,900 Z",
              "M0,680 C340,600 740,740 1060,670 C1280,630 1400,700 1440,660 L1440,900 L0,900 Z",
              "M0,650 C360,720 720,580 1080,660 C1260,700 1380,620 1440,650 L1440,900 L0,900 Z",
            ],
          }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
