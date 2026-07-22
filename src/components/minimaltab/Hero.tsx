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
    <div className="mx-auto w-full max-w-3xl text-center">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{date}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {g}{name ? `, ${name}` : ""}.
      </h1>
      <p className="mt-1 font-mono text-5xl font-light tracking-tight text-foreground/90 tabular-nums sm:text-6xl lg:text-7xl">
        {time}
      </p>
      {dailyFocus ? (
        <p className="mx-auto mt-4 max-w-md rounded-full border border-border bg-card/60 px-4 py-1.5 text-sm text-foreground/80 backdrop-blur">
          {dailyFocus}
        </p>
      ) : null}
      <blockquote className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground">
        “{quote.text}”
        <span className="ml-2 text-foreground/50">— {quote.author}</span>
      </blockquote>
    </div>
  );
}
