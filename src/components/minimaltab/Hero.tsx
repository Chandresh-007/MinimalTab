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
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground sm:text-sm">{date}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
        {g}{name ? `, ${name}` : ""}.
      </p>
      <p className="mt-1 font-mono text-4xl font-light tracking-tight text-foreground/90 tabular-nums sm:text-5xl lg:text-6xl">
        {time}
      </p>
      {dailyFocus ? (
        <p className="mx-auto mt-5 max-w-xl rounded-full border border-border bg-card/60 px-4 py-1.5 text-sm text-foreground/80 backdrop-blur">
          {dailyFocus}
        </p>
      ) : null}
      <blockquote className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        “{quote.text}”
        <span className="ml-2 block text-xs text-foreground/50 sm:ml-2 sm:inline sm:text-sm">— {quote.author}</span>
      </blockquote>
    </div>
  );
}
