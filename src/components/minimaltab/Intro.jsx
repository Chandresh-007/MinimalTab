import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { StrokeText } from "./StrokeText";
const INTRO_DURATION = 2600;
function Intro() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), INTRO_DURATION);
    return () => clearTimeout(t);
  }, []);
  return <AnimatePresence>
      {show && <motion.div
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, scale: 1.02 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
    aria-hidden={!show}
  >
          <div className="w-full max-w-lg px-8">
            <StrokeText
    text="MinimalTab"
    strokeColor="var(--foreground)"
    fillColor="var(--foreground)"
    strokeWidth={1.2}
    drawDuration={1.2}
    fillDelay={0.1}
    stagger={0.05}
    fontSize={72}
    fontWeight={800}
    letterSpacing={-2}
    fillMode="wipe"
  />
            <motion.p
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.6, duration: 0.5 }}
    className="mt-3 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground"
  >
              Your browser's productivity OS
            </motion.p>
          </div>
        </motion.div>}
    </AnimatePresence>;
}
export {
  Intro
};
