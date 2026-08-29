import { useEffect, useMemo, useRef, useState } from "react";
import { Search as SearchIcon, ChevronDown, CornerDownLeft, Clock, X } from "lucide-react";
import { ENGINES, routeSearch } from "@/lib/minimaltab/search";
import { useLocalStorage } from "@/lib/minimaltab/storage";
function UniversalSearch({
  defaultEngine,
  setDefaultEngine,
  onRecent
}) {
  const [q, setQ] = useState("");
  const [engineOpen, setEngineOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [focused, setFocused] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [, setRecent] = useLocalStorage("mt.recent", []);
  const [history, setHistory] = useLocalStorage("mt.history", []);
  const inputRef = useRef(null);
  useEffect(() => {
    if (!q.trim()) {
      setPreview(null);
      return;
    }
    const r = routeSearch(q, defaultEngine);
    setPreview({ engine: r.engine, query: r.query });
  }, [q, defaultEngine]);

  const suggestions = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = Array.isArray(history) ? history : [];
    const matched = term ? list.filter((h) => h.q.toLowerCase().includes(term)) : list;
    return matched.slice(0, 6);
  }, [history, q]);

  useEffect(() => setHighlight(-1), [q, focused]);

  const showHistory = focused && suggestions.length > 0;

  const run = (query, engineId) => {
    const engine = engineId ?? defaultEngine;
    const { url, engine: engineName } = routeSearch(query, engine);
    if (!url) return;
    setRecent((prev) => [query, ...prev.filter((x) => x !== query)].slice(0, 8));
    setHistory((prev) => [
      { q: query, engine, engineName, ts: Date.now() },
      ...(Array.isArray(prev) ? prev : []).filter((h) => h.q !== query)
    ].slice(0, 25));
    onRecent(query);
    window.open(url, "_blank");
    setQ("");
    setFocused(false);
  };

  const submit = (e) => {
    e.preventDefault();
    if (highlight >= 0 && suggestions[highlight]) {
      const s = suggestions[highlight];
      run(s.q, s.engine);
      return;
    }
    if (!q.trim()) return;
    run(q);
  };

  const onKeyDown = (e) => {
    if (!showHistory) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setFocused(false);
    }
  };

  const removeItem = (query) => {
    setHistory((prev) => (Array.isArray(prev) ? prev : []).filter((h) => h.q !== query));
    inputRef.current?.focus();
  };

  const active = ENGINES[defaultEngine] ?? ENGINES.duckduckgo;
  return <form onSubmit={submit} className="mx-auto w-full max-w-2xl">
      <div className="group relative flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-shadow duration-150 focus-within:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_30px_-8px_rgba(0,0,0,0.12)] focus-within:border-foreground/20 sm:px-5 sm:py-4">
        <SearchIcon className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" aria-hidden />
        <input
    ref={inputRef}
    value={q}
    onChange={(e) => setQ(e.target.value)}
    onFocus={() => setFocused(true)}
    onBlur={() => window.setTimeout(() => setFocused(false), 120)}
    onKeyDown={onKeyDown}
    placeholder="Search the web"
    className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-lg"
    aria-label="Universal search"
    autoComplete="off"
    aria-expanded={showHistory}
    aria-controls="search-history-list"
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
          {engineOpen && <div
    className="absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg"
    role="listbox"
  >
              {Object.values(ENGINES).map((e) => <button
    key={e.id}
    type="button"
    role="option"
    aria-selected={e.id === defaultEngine}
    onClick={() => {
      setDefaultEngine(e.id);
      setEngineOpen(false);
    }}
    className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm ${e.id === defaultEngine ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
  >
                  {e.name}
                </button>)}
            </div>}
        </div>
        <button
    type="submit"
    aria-label="Search"
    className="rounded-lg border border-border bg-background p-1.5 text-muted-foreground transition-colors hover:text-foreground"
  >
          <CornerDownLeft className="h-4 w-4" />
        </button>

        {showHistory && <div
    id="search-history-list"
    role="listbox"
    className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg"
  >
            <div className="flex items-center justify-between px-2.5 py-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Search history</span>
              <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={() => setHistory([])}
    className="text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
  >
                Clear all
              </button>
            </div>
            {suggestions.map((s, i) => <div
    key={`${s.q}-${s.ts}`}
    role="option"
    aria-selected={i === highlight}
    className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm ${i === highlight ? "bg-muted text-foreground" : "text-muted-foreground"}`}
  >
                <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={() => run(s.q, s.engine)}
    onMouseEnter={() => setHighlight(i)}
    className="min-w-0 flex-1 truncate text-left hover:text-foreground"
  >
                  {s.q}
                </button>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {s.engineName ?? ENGINES[s.engine]?.name ?? ""}
                </span>
                <button
    type="button"
    aria-label={`Remove ${s.q} from history`}
    onMouseDown={(e) => e.preventDefault()}
    onClick={() => removeItem(s.q)}
    className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
  >
                  <X className="h-3 w-3" />
                </button>
              </div>)}
          </div>}
      </div>
      {preview && !showHistory && <p className="mt-2 pl-1 text-xs text-muted-foreground">
          <span className="text-foreground/70">↵</span> Search <span className="font-medium text-foreground">{preview.engine}</span> for “{preview.query}”
        </p>}
    </form>;
}
export {
  UniversalSearch
};
