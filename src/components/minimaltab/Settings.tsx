import { X } from "lucide-react";
import { ENGINES } from "@/lib/minimaltab/search";

// Kept for backwards-compat imports; wallpaper feature has been removed.
export type WallpaperId = "none";

export function Settings({
  open,
  onClose,
  name,
  setName,
  defaultEngine,
  setDefaultEngine,
  dailyFocus,
  setDailyFocus,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  setName: (v: string) => void;
  defaultEngine: string;
  setDefaultEngine: (v: string) => void;
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
            <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Appearance</h3>
            <p className="text-xs text-muted-foreground">Use the sun / moon toggle in the header to switch between light and dark mode. The ambient background adapts automatically.</p>
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
