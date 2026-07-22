import { X, Check } from "lucide-react";
import { ENGINES } from "@/lib/minimaltab/search";

export const WALLPAPERS = [
  { id: "none", label: "None", gradient: "bg-background" },
  { id: "minimal", label: "Minimal", gradient: "bg-gradient-to-br from-slate-100 to-white dark:from-slate-900 dark:to-slate-950" },
  { id: "aurora", label: "Aurora", gradient: "bg-gradient-to-br from-indigo-100/40 via-sky-100/30 to-teal-100/30 dark:from-indigo-900/30 dark:via-sky-900/20 dark:to-teal-900/20" },
  { id: "sunset", label: "Sunset", gradient: "bg-gradient-to-br from-rose-100/40 via-orange-100/30 to-violet-100/30 dark:from-rose-900/30 dark:via-orange-900/20 dark:to-violet-900/20" },
  { id: "forest", label: "Forest", gradient: "bg-gradient-to-br from-emerald-100/40 via-teal-100/30 to-lime-100/20 dark:from-emerald-900/30 dark:via-teal-900/20 dark:to-lime-900/10" },
  { id: "solid", label: "Solid", gradient: "bg-muted/30" },
] as const;

export type WallpaperId = (typeof WALLPAPERS)[number]["id"];

export function Settings({
  open,
  onClose,
  name,
  setName,
  defaultEngine,
  setDefaultEngine,
  wallpaper,
  setWallpaper,
  dailyFocus,
  setDailyFocus,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  setName: (v: string) => void;
  defaultEngine: string;
  setDefaultEngine: (v: string) => void;
  wallpaper: WallpaperId;
  setWallpaper: (v: WallpaperId) => void;
  dailyFocus: string;
  setDailyFocus: (v: string) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Settings">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-sm overflow-y-auto border-l border-border bg-background p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Settings</h2>
          <button onClick={onClose} aria-label="Close settings" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 space-y-6 text-sm">
          <section>
            <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Profile</h3>
            <label className="block">
              <span className="mb-1 block text-xs text-muted-foreground">Your name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full rounded-lg border border-border bg-transparent px-3 py-2 outline-none focus:border-foreground/40"
              />
            </label>
          </section>

          <section>
            <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Daily focus</h3>
            <label className="block">
              <span className="mb-1 block text-xs text-muted-foreground">What matters today?</span>
              <input
                value={dailyFocus}
                onChange={(e) => setDailyFocus(e.target.value)}
                placeholder="Ship the new landing page…"
                className="w-full rounded-lg border border-border bg-transparent px-3 py-2 outline-none focus:border-foreground/40"
              />
            </label>
          </section>

          <section>
            <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Wallpaper</h3>
            <div className="grid grid-cols-3 gap-2">
              {WALLPAPERS.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setWallpaper(w.id)}
                  className={`relative flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border transition-all ${
                    wallpaper === w.id
                      ? "border-foreground/40 ring-2 ring-foreground/10"
                      : "border-border hover:border-foreground/30"
                  } ${w.gradient}`}
                  aria-label={`Set wallpaper ${w.label}`}
                >
                  {wallpaper === w.id && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-background">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                  <span className="text-xs font-medium text-foreground">{w.label}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Wallpapers adapt automatically to light and dark mode.</p>
          </section>

          <section>
            <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Appearance</h3>
            <p className="text-xs text-muted-foreground">Use the sun / moon toggle in the header to switch between light and dark mode.</p>
          </section>

          <section>
            <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Default search engine</h3>
            <select
              value={defaultEngine}
              onChange={(e) => setDefaultEngine(e.target.value)}
              className="w-full rounded-lg border border-border bg-transparent px-3 py-2 outline-none focus:border-foreground/40"
            >
              {Object.values(ENGINES).map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </section>

          <section>
            <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Keyboard shortcuts</h3>
            <dl className="space-y-1.5 text-xs">
              {[
                ["Command palette", "⌘K / Ctrl+K"],
                ["Focus mode", "⌘/"],
                ["Search", "/"],
                ["New note", "N"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd><kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">{v}</kbd></dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </aside>
    </div>
  );
}
