import { useEffect, useMemo, useState } from "react";
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
      <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground sm:text-base">{date}</p>
      <p className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
        {g}{name ? `, ${name}` : ""}.
      </p>
      <p className="mt-2 font-mono text-6xl font-light tracking-tight text-foreground/90 tabular-nums sm:text-7xl lg:text-8xl">
        {time}
      </p>
      {dailyFocus ? (
        <p className="mx-auto mt-6 max-w-xl rounded-full border border-border bg-card/60 px-5 py-2 text-base text-foreground/80 backdrop-blur">
          {dailyFocus}
        </p>
      ) : null}
      <blockquote className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
        “{quote.text}”
        <span className="ml-2 block text-sm text-foreground/50 sm:ml-3 sm:inline sm:text-base">— {quote.author}</span>
      </blockquote>
    </div>
  );
}
