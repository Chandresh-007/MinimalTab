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
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{date}</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        {g}{name ? `, ${name}` : ""}.
      </h1>
      <p className="mt-2 font-mono text-6xl font-light tracking-tight text-foreground/90 tabular-nums sm:text-7xl">
        {time}
      </p>
      <blockquote className="mx-auto mt-6 max-w-lg text-sm text-muted-foreground">
        "{quote.text}"
        <span className="ml-2 text-foreground/50">— {quote.author}</span>
      </blockquote>
    </div>
  );
}
