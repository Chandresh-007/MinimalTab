import { useEffect, useState } from "react";
import { Cloud, CloudRain, CloudSnow, CloudSun, Droplets, Loader2, MapPin, Moon, Sun, Wind } from "lucide-react";
import { describeWeather, fetchWeather, getLocation, reverseGeocode, type Weather } from "@/lib/minimaltab/weather";

function weatherIcon(code: number, isDay: boolean, className?: string) {
  if (code <= 1) return isDay ? <Sun className={className} /> : <Moon className={className} />;
  if (code <= 3) return <CloudSun className={className} />;
  if (code <= 48) return <Cloud className={className} />;
  if (code <= 67 || code <= 82) return <CloudRain className={className} />;
  if (code <= 86) return <CloudSnow className={className} />;
  if (code <= 99) return <Wind className={className} />;
  return <Droplets className={className} />;
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getLocation()
      .then(async ({ lat, lon }) => {
        const city = await reverseGeocode(lat, lon);
        if (cancelled) return;
        const w = await fetchWeather(lat, lon, city);
        if (!cancelled) setWeather(w);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Location unavailable");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 text-xs text-muted-foreground backdrop-blur">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span className="hidden sm:inline">Weather</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div
        title={error ?? "Weather unavailable"}
        className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 text-xs text-muted-foreground backdrop-blur"
      >
        <MapPin className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Weather</span>
      </div>
    );
  }

  return (
    <div className="group relative flex h-9 items-center gap-2 rounded-full border border-border bg-card/70 px-3 text-xs backdrop-blur transition-colors hover:bg-card">
      {weatherIcon(weather.code, weather.isDay, "h-4 w-4 text-foreground/80")}
      <span className="font-medium text-foreground">{weather.temp}°</span>
      <span className="hidden text-muted-foreground sm:inline">{describeWeather(weather.code)}</span>
      {weather.city && <span className="hidden text-muted-foreground/70 md:inline">· {weather.city}</span>}

      {/* Mini hourly tooltip */}
      <div className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-44 rounded-xl border border-border bg-popover p-2 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        <p className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">Next 3 hours</p>
        <div className="flex justify-between">
          {weather.hourly.map((h) => (
            <div key={h.time} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">{h.time}</span>
              {weatherIcon(h.code, weather.isDay, "h-3.5 w-3.5 text-foreground/70")}
              <span className="text-[11px] font-medium text-foreground">{h.temp}°</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
