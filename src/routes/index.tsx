import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell, Settings as SettingsIcon, User, Plus, Search, Sparkles,
  LayoutGrid, Bookmark, StickyNote, Calendar as CalendarIcon, Timer,
  Home, Cpu,
} from "lucide-react";

import { UniversalSearch } from "@/components/minimaltab/UniversalSearch";
import { Hero } from "@/components/minimaltab/Hero";
import { QuickAccess } from "@/components/minimaltab/QuickAccess";
import { TodayFocus } from "@/components/minimaltab/TodayFocus";
import { Notes } from "@/components/minimaltab/Notes";
import { CommandPalette } from "@/components/minimaltab/CommandPalette";
import { Settings } from "@/components/minimaltab/Settings";
import { useHydrated, useLocalStorage } from "@/lib/minimaltab/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MinimalTab — Your Browser's Productivity OS" },
      { name: "description", content: "Universal search, command palette, notes, Pomodoro, and quick links — beautifully minimal." },
      { property: "og:title", content: "MinimalTab — Your Browser's Productivity OS" },
      { property: "og:description", content: "A calm, keyboard-first homepage for people who ship." },
    ],
  }),
  component: MinimalTab,
});

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "workspace", label: "Workspace", icon: LayoutGrid },
  { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "focus", label: "Focus", icon: Sparkles },
  { id: "ai", label: "AI", icon: Cpu },
  { id: "calendar", label: "Calendar", icon: CalendarIcon },
];

function MinimalTab() {
  const hydrated = useHydrated();
  const [theme, setTheme] = useLocalStorage<string>("mt.theme", "light");
  const [name, setName] = useLocalStorage<string>("mt.name", "");
  const [engine, setEngine] = useLocalStorage<string>("mt.engine", "duckduckgo");
  const [recent, setRecent] = useLocalStorage<string[]>("mt.recent", []);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [timerTick, setTimerTick] = useState(0);
  const [nav, setNav] = useState("dashboard");

  // Apply theme
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (theme === "midnight" || theme === "terminal") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Global shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (meta && e.key === "/") {
        e.preventDefault();
        setFocusMode((v) => !v);
      } else if (!typing && e.key === "/") {
        e.preventDefault();
        (document.querySelector('input[aria-label="Universal search"]') as HTMLInputElement | null)?.focus();
      } else if (!typing && e.key.toLowerCase() === "t") {
        setTimerTick((n) => n + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const cycleTheme = () => {
    const order = ["light", "paper", "notion", "midnight", "terminal"];
    const i = order.indexOf(theme);
    setTheme(order[(i + 1) % order.length]);
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background">
              <span className="text-[13px] font-semibold">M</span>
            </span>
            <span className="hidden text-sm font-semibold tracking-tight sm:inline">MinimalTab</span>
          </div>
          <button
            onClick={() => setPaletteOpen(true)}
            className="ml-2 flex flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Open command palette"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 truncate">Command palette · search anything</span>
            <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
          </button>
          <div className="flex items-center gap-1">
            <button onClick={() => setPaletteOpen(true)} aria-label="Quick add" className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <Plus className="h-4 w-4" />
            </button>
            <button aria-label="Notifications" className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <Bell className="h-4 w-4" />
            </button>
            <button onClick={() => setSettingsOpen(true)} aria-label="Settings" className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <SettingsIcon className="h-4 w-4" />
            </button>
            <button aria-label="Profile" className="ml-1 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
              <User className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 md:grid-cols-[14rem_1fr]">
        {/* Sidebar */}
        {!focusMode && (
          <aside className="hidden md:block">
            <nav aria-label="Primary" className="sticky top-20 space-y-0.5">
              {NAV.map((n) => {
                const Icon = n.icon;
                const active = nav === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => setNav(n.id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
                      active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {n.label}
                  </button>
                );
              })}
              <div className="mt-4 border-t border-border pt-3">
                <button
                  onClick={() => setFocusMode(true)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                >
                  <Sparkles className="h-4 w-4" />
                  Focus mode
                  <kbd className="ml-auto rounded border border-border px-1 py-0 font-mono text-[9px]">⌘/</kbd>
                </button>
              </div>
            </nav>
          </aside>
        )}

        {/* Main */}
        <main className="min-w-0">
          <motion.section
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
            className="rounded-3xl border border-border bg-card p-8 sm:p-12"
          >
            <Hero />
            <div className="mt-8">
              {hydrated && (
                <UniversalSearch
                  defaultEngine={engine}
                  setDefaultEngine={setEngine}
                  onRecent={(q) => setRecent((prev) => [q, ...prev.filter((x) => x !== q)].slice(0, 8))}
                />
              )}
            </div>
            {!focusMode && recent.length > 0 && (
              <div className="mx-auto mt-4 flex max-w-2xl flex-wrap items-center gap-1.5">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Recent</span>
                {recent.slice(0, 6).map((r) => (
                  <button
                    key={r}
                    onClick={() => (document.querySelector('input[aria-label="Universal search"]') as HTMLInputElement | null)?.focus()}
                    className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </motion.section>

          {!focusMode && (
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <QuickAccess />
                <Notes />
              </div>
              <div className="space-y-6">
                <TodayFocus triggerStart={timerTick} />
                <section className="rounded-2xl border border-border bg-card p-5">
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <Cpu className="h-4 w-4 text-muted-foreground" /> AI assistant
                  </h2>
                  <p className="text-xs text-muted-foreground">Type <kbd className="rounded border border-border px-1 py-0.5 font-mono text-[10px]">ai</kbd> in search, then your question.</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {["Explain", "Summarize", "Translate", "Generate code", "Research"].map((a) => (
                      <span key={a} className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">{a}</span>
                    ))}
                  </div>
                </section>
                <section className="rounded-2xl border border-border bg-card p-5">
                  <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" /> Today
                  </h2>
                  <p className="text-xs text-muted-foreground">No events. Your calendar is clear — do deep work.</p>
                </section>
              </div>
            </div>
          )}

          {focusMode && (
            <div className="mt-16 text-center">
              <button
                onClick={() => setFocusMode(false)}
                className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                Exit focus mode · ⌘/
              </button>
            </div>
          )}
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onOpenNotes={() => { setFocusMode(false); document.querySelector('#notes-heading')?.scrollIntoView({ behavior: "smooth" }); }}
        onOpenSettings={() => setSettingsOpen(true)}
        onStartTimer={() => setTimerTick((n) => n + 1)}
        onToggleFocus={() => setFocusMode((v) => !v)}
        onToggleTheme={cycleTheme}
        defaultEngine={engine}
      />
      <Settings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        name={name}
        setName={setName}
        theme={theme}
        setTheme={setTheme}
        defaultEngine={engine}
        setDefaultEngine={setEngine}
      />
    </div>
  );
}
