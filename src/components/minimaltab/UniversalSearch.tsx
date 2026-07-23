import { useEffect, useState } from "react";
import { Search as SearchIcon, ChevronDown, CornerDownLeft } from "lucide-react";
import { ENGINES, routeSearch } from "@/lib/minimaltab/search";
import { useLocalStorage } from "@/lib/minimaltab/storage";

export function UniversalSearch({
  defaultEngine,
  setDefaultEngine,
  onRecent,
}: {
  defaultEngine: string;
  setDefaultEngine: (id: string) => void;
  onRecent: (q: string) => void;
}) {
  const [q, setQ] = useState("");
  const [engineOpen, setEngineOpen] = useState(false);
  const [preview, setPreview] = useState<{ engine: string; query: string } | null>(null);
  const [, setRecent] = useLocalStorage<string[]>("mt.recent", []);

  useEffect(() => {
    if (!q.trim()) { setPreview(null); return; }
    const r = routeSearch(q, defaultEngine);
    setPreview({ engine: r.engine, query: r.query });
  }, [q, defaultEngine]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const { url } = routeSearch(q, defaultEngine);
    if (!url) return;
    setRecent((prev) => [q, ...prev.filter((x) => x !== q)].slice(0, 8));
    onRecent(q);
    window.open(url, "_blank");
    setQ("");
  };

  const active = ENGINES[defaultEngine] ?? ENGINES.duckduckgo;

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-2xl">
      <div className="group relative flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-shadow duration-150 focus-within:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_30px_-8px_rgba(0,0,0,0.12)] focus-within:border-foreground/20 sm:px-5 sm:py-4">
        <SearchIcon className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search the web"
          className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-lg"
          aria-label="Universal search"
          autoFocus
        />
        <div className="relative">
          <button
            type="button"
            onClick={() => setEngineOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            aria-haspopup="listbox"
            aria-expanded={engineOpen}
          >
            {active.name}
            <ChevronDown className="h-3 w-3" />
          </button>
          {engineOpen && (
            <div
              className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg"
              role="listbox"
            >
              {Object.values(ENGINES).map((e) => (
                <button
                  key={e.id}
                  type="button"
                  role="option"
                  aria-selected={e.id === defaultEngine}
                  onClick={() => { setDefaultEngine(e.id); setEngineOpen(false); }}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm ${
                    e.id === defaultEngine ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  {e.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          aria-label="Search"
          className="rounded-lg border border-border bg-background p-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <CornerDownLeft className="h-4 w-4" />
        </button>
      </div>
      {preview && (
        <p className="mt-2 pl-1 text-xs text-muted-foreground">
          <span className="text-foreground/70">↵</span> Search <span className="font-medium text-foreground">{preview.engine}</span> for “{preview.query}”
        </p>
      )}
    </form>
  );
}
