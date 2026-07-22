import { motion } from "framer-motion";

/**
 * Animated wavy background. Uses currentColor via foreground with low opacity
 * so it adapts automatically to light and dark modes.
 */
export function WaveBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Soft radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,theme(colors.foreground/6),transparent_60%)]" />

      <svg
        className="absolute inset-x-0 top-0 h-full w-full"
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
        </defs>

        <g className="text-foreground">
          <motion.path
            fill="url(#wave-a)"
            initial={{ d: "M0,300 C300,420 600,180 900,280 C1200,380 1320,260 1440,300 L1440,900 L0,900 Z" }}
            animate={{
              d: [
                "M0,300 C300,420 600,180 900,280 C1200,380 1320,260 1440,300 L1440,900 L0,900 Z",
                "M0,340 C280,240 620,420 920,340 C1180,270 1320,380 1440,320 L1440,900 L0,900 Z",
                "M0,300 C300,420 600,180 900,280 C1200,380 1320,260 1440,300 L1440,900 L0,900 Z",
              ],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            fill="url(#wave-b)"
            initial={{ d: "M0,500 C240,600 540,420 840,500 C1140,580 1320,460 1440,520 L1440,900 L0,900 Z" }}
            animate={{
              d: [
                "M0,500 C240,600 540,420 840,500 C1140,580 1320,460 1440,520 L1440,900 L0,900 Z",
                "M0,540 C260,440 560,600 860,520 C1140,450 1320,560 1440,500 L1440,900 L0,900 Z",
                "M0,500 C240,600 540,420 840,500 C1140,580 1320,460 1440,520 L1440,900 L0,900 Z",
              ],
            }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
        </g>
      </svg>
    </div>
  );
}
