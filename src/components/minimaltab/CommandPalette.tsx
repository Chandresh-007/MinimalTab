import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Command, Search, ArrowRight, Sparkles, StickyNote, Timer, Settings as SettingsIcon, Github, Mail, Youtube } from "lucide-react";
import { routeSearch } from "@/lib/minimaltab/search";

type Item = {
  id: string;
  label: string;
  hint?: string;
  action: () => void;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
};

export function CommandPalette({
  open,
  onOpenChange,
  onOpenNotes,
  onOpenSettings,
  onStartTimer,
  onToggleFocus,
  onToggleTheme,
  defaultEngine,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onOpenNotes: () => void;
  onOpenSettings: () => void;
  onStartTimer: () => void;
  onToggleFocus: () => void;
  onToggleTheme: () => void;
  defaultEngine: string;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const staticItems: Item[] = [
    { id: "notes", label: "Open Notes", icon: StickyNote, group: "Actions", action: onOpenNotes, hint: "N" },
    { id: "timer", label: "Start Pomodoro (25 min)", icon: Timer, group: "Actions", action: onStartTimer, hint: "T" },
    { id: "focus", label: "Toggle Focus Mode", icon: Sparkles, group: "Actions", action: onToggleFocus, hint: "F" },
    { id: "theme", label: "Toggle Theme", icon: Sparkles, group: "Actions", action: onToggleTheme },
    { id: "settings", label: "Open Settings", icon: SettingsIcon, group: "Actions", action: onOpenSettings, hint: "," },
    { id: "github", label: "Open GitHub", icon: Github, group: "Quick Links", action: () => window.open("https://github.com", "_blank") },
    { id: "gmail", label: "Open Gmail", icon: Mail, group: "Quick Links", action: () => window.open("https://mail.google.com", "_blank") },
    { id: "yt", label: "Open YouTube", icon: Youtube, group: "Quick Links", action: () => window.open("https://youtube.com", "_blank") },
  ];

  const q = query.trim().toLowerCase();
  const filtered = q
    ? staticItems.filter((i) => i.label.toLowerCase().includes(q))
    : staticItems;

  const showSearchItem = q.length > 0;
  const searchItem: Item | null = showSearchItem
    ? {
        id: "search",
        label: `Search "${query}"`,
        icon: Search,
        group: "Search",
        action: () => {
          const { url } = routeSearch(query, defaultEngine);
          if (url) window.open(url, "_blank");
        },
      }
    : null;

  const items: Item[] = searchItem ? [searchItem, ...filtered] : filtered;

  useEffect(() => setActive(0), [query]);

  const runActive = () => {
    const it = items[active];
    if (it) {
      it.action();
      onOpenChange(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(items.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); runActive(); }
    else if (e.key === "Escape") { onOpenChange(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/20 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
          role="dialog" aria-modal="true" aria-label="Command palette"
        >
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Command className="h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Type a command or search…"
                className="flex-1 bg-transparent py-4 text-[15px] outline-none placeholder:text-muted-foreground"
                aria-label="Command input"
              />
              <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">ESC</kbd>
            </div>
            <ul className="max-h-[50vh] overflow-y-auto p-2">
              {items.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">No results</li>
              )}
              {items.map((it, i) => {
                const Icon = it.icon;
                const isActive = i === active;
                return (
                  <li key={it.id}>
                    <button
                      onMouseEnter={() => setActive(i)}
                      onClick={() => { it.action(); onOpenChange(false); }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                        isActive ? "bg-muted" : "hover:bg-muted/60"
                      }`}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 text-foreground">{it.label}</span>
                      <span className="text-xs text-muted-foreground">{it.group}</span>
                      {isActive && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
