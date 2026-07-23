import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocalStorage } from "@/lib/minimaltab/storage";
import { quoteOfDay } from "@/lib/minimaltab/quotes";

function greeting(h: number) {
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

export function Hero() {
  const [name] = useLocalStorage<string>("mt.name", "");
  const [dailyFocus] = useLocalStorage<string>("mt.dailyFocus", "");
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const quote = useMemo(() => quoteOfDay(), []);
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  const date = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
  const g = greeting(now.getHours());

  return (
    <div className="mx-auto w-full max-w-4xl text-center">
      <h1 className="sr-only">MinimalTab — Productivity Dashboard for your browser</h1>
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground sm:text-sm">{date}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {g}{name ? `, ${name}` : ""}
      </p>
      <p className="mt-1 font-mono text-4xl font-light tracking-tight text-foreground/90 tabular-nums sm:text-5xl lg:text-6xl">
        {time}
      </p>
      {dailyFocus ? (
        <p className="mx-auto mt-5 max-w-xl rounded-full border border-border bg-card/60 px-4 py-1.5 text-sm text-foreground/80 backdrop-blur">
          {dailyFocus}
        </p>
      ) : null}
      <AnimatePresence mode="wait">
        <motion.blockquote
          key={quote.text}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-8 max-w-2xl px-4 text-balance font-serif text-base italic leading-relaxed text-foreground/75 sm:text-lg lg:text-xl"
        >
          <span className="mr-1 select-none text-2xl leading-none text-foreground/30">“</span>
          {quote.text}
          <span className="ml-1 select-none text-2xl leading-none text-foreground/30">”</span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="mt-2 block text-xs font-sans not-italic uppercase tracking-[0.2em] text-muted-foreground sm:text-sm"
          >
            — {quote.author}
          </motion.span>
        </motion.blockquote>
      </AnimatePresence>
    </div>
  );
}
