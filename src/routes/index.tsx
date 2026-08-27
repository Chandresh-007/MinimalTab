import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Search, Sparkles } from "lucide-react";

import { UniversalSearch } from "@/components/minimaltab/UniversalSearch";
import { Hero } from "@/components/minimaltab/Hero";
import { QuickAccess } from "@/components/minimaltab/QuickAccess";
import { Notes } from "@/components/minimaltab/Notes";
import { Todos } from "@/components/minimaltab/Todos";
import { CommandPalette } from "@/components/minimaltab/CommandPalette";
import { Settings } from "@/components/minimaltab/Settings";
import { WaveBackground } from "@/components/minimaltab/WaveBackground";
import { ThemeToggle } from "@/components/minimaltab/ThemeToggle";
import { WeatherWidget } from "@/components/minimaltab/WeatherWidget";
import { BuyMeCoffee } from "@/components/minimaltab/BuyMeCoffee";
import { WelcomeDialog } from "@/components/minimaltab/WelcomeDialog";
import { Intro } from "@/components/minimaltab/Intro";
import { ClickSpark } from "@/components/minimaltab/ClickSpark";
import { useHydrated, useLocalStorage } from "@/lib/minimaltab/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MinimalTab — Your Browser's Productivity OS" },
      { name: "description", content: "Universal search, command palette, notes, and quick links — beautifully minimal." },
      { property: "og:title", content: "MinimalTab — Your Browser's Productivity OS" },
      { property: "og:description", content: "Universal search, command palette, notes, and quick links — beautifully minimal." },
    ],
  }),
  component: MinimalTab,
});

// Reveal the new theme with a circular clip-path expanding from the click point.
// Uses the View Transitions API where available so the real (already-repainted)
// theme is unveiled — no full-screen white/black flash.
function runThemeTransition(x: number, y: number, apply: () => void) {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { ready: Promise<void> };
  };
  if (!doc.startViewTransition) {
    apply();
    return;
  }
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
  const transition = doc.startViewTransition(() => {
    flushSync(apply);
  });
  transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0 at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 520,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {
      /* ignore — fallback is instant swap */
    });
}

function MinimalTab() {
  const hydrated = useHydrated();
  const [dark, setDark] = useLocalStorage<boolean>("mt.dark", false);
  const [boss, setBoss] = useLocalStorage<boolean>("mt.boss", false);
  const [name, setName] = useLocalStorage<string>("mt.name", "");
  const [engine, setEngine] = useLocalStorage<string>("mt.engine", "duckduckgo");
  const [recent, setRecent] = useLocalStorage<string[]>("mt.recent", []);
  
  const [dailyFocus, setDailyFocus] = useLocalStorage<string>("mt.dailyFocus", "");
  const [onboarded, setOnboarded] = useLocalStorage<boolean>("mt.onboarded", false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("boss", !!boss);
    // Boss theme is inherently dark; force dark class so ambient bg adapts.
    root.classList.toggle("dark", !!dark || !!boss);
  }, [dark, boss]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement | null;
      const typing =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      } else if (meta && e.key === "/") {
        e.preventDefault();
        setFocusMode((v) => !v);
      } else if (!typing && e.key === "/") {
        e.preventDefault();
        (document.querySelector('input[aria-label="Universal search"]') as HTMLInputElement | null)?.focus();
      } else if (e.key === "Escape" && !typing) {
        // Bring focus back to the search input as a safe default.
        (document.querySelector('input[aria-label="Universal search"]') as HTMLInputElement | null)?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleMode = (e?: React.MouseEvent) => {
    const x = e?.clientX ?? window.innerWidth - 40;
    const y = e?.clientY ?? 40;
    runThemeTransition(x, y, () => setDark(!dark));
  };

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      <Intro />
      <WaveBackground />
      <ClickSpark
        sparkColor={dark || boss ? "#ffffff" : "#212529"}
        sparkSize={10}
        sparkRadius={18}
        sparkCount={8}
        duration={450}
      >

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background">
              <span className="text-[13px] font-semibold">M</span>
            </span>
            <span className="hidden text-sm font-semibold tracking-tight sm:inline">MinimalTab</span>
          </div>
          <button
            onClick={() => setPaletteOpen(true)}
            className="ml-2 flex flex-1 items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-1.5 text-left text-xs text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
            aria-label="Open command palette"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 truncate">Search anything</span>
            <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] sm:inline">⌘K</kbd>
          </button>
          <div className="flex items-center gap-1">
            {hydrated && <WeatherWidget />}
            <BuyMeCoffee />
            <ThemeToggle dark={!!dark} onToggle={(ev) => toggleMode(ev)} />
            <button
              onClick={() => setFocusMode((v) => !v)}
              aria-label="Toggle focus mode"
              className={`rounded-md p-2 transition-colors hover:bg-muted ${
                focusMode ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-4 w-4" />
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              aria-label="Settings"
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <SettingsIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-auto min-w-0 max-w-3xl"
        >
          <Hero />
          <div className="mt-6 sm:mt-8">
            {hydrated && (
              <UniversalSearch
                defaultEngine={engine}
                setDefaultEngine={setEngine}
                onRecent={(q) =>
                  setRecent((prev) => [q, ...prev.filter((x) => x !== q)].slice(0, 8))
                }
              />
            )}
          </div>
          {!focusMode && recent.length > 0 && (
            <div className="mx-auto mt-4 flex max-w-2xl flex-wrap items-center justify-center gap-1.5">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Recent</span>
              {recent.slice(0, 6).map((r) => (
                <button
                  key={r}
                  onClick={() =>
                    (document.querySelector('input[aria-label="Universal search"]') as HTMLInputElement | null)?.focus()
                  }
                  className="rounded-full border border-border bg-background/60 px-2.5 py-0.5 text-xs text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </motion.section>

        {!focusMode && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.14 }}
            className="mt-10 sm:mt-14"
          >
            <QuickAccess />
          </motion.div>
        )}

        {!focusMode && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 sm:mt-14"
          >
            <Notes />
            <Todos />
          </motion.div>
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

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onOpenNotes={() => {
          setFocusMode(false);
          document.querySelector("#notes-heading")?.scrollIntoView({ behavior: "smooth" });
        }}
        onOpenSettings={() => setSettingsOpen(true)}
        onToggleFocus={() => setFocusMode((v) => !v)}
        onToggleTheme={() => toggleMode()}
        defaultEngine={engine}
      />
      <Settings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        name={name}
        setName={setName}
        defaultEngine={engine}
        setDefaultEngine={setEngine}
        dailyFocus={dailyFocus}
        setDailyFocus={setDailyFocus}
        boss={!!boss}
        setBoss={setBoss}
      />
      {hydrated && (
        <WelcomeDialog
          open={!onboarded}
          onSubmit={(n) => { setName(n); setOnboarded(true); }}
          onSkip={() => setOnboarded(true)}
        />
      )}
      </ClickSpark>
    </div>
  );
}
