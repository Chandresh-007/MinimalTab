import { useState } from "react";
import { Plus, X, ExternalLink } from "lucide-react";
import { DEFAULT_LINKS, ICONS, type QuickLink } from "@/lib/minimaltab/links";
import { useLocalStorage } from "@/lib/minimaltab/storage";

export function QuickAccess() {
  const [links, setLinks] = useLocalStorage<QuickLink[]>("mt.quicklinks", DEFAULT_LINKS);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const add = () => {
    if (!name.trim() || !url.trim()) return;
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    setLinks([...links, { id: crypto.randomUUID(), name: name.trim(), url: href, icon: "chat" }]);
    setName(""); setUrl(""); setAdding(false);
  };

  const remove = (id: string) => setLinks(links.filter((l) => l.id !== id));

  return (
    <section aria-labelledby="quick-access-heading">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 id="quick-access-heading" className="text-sm font-medium text-foreground">Quick access</h2>
        <button
          onClick={() => setAdding((v) => !v)}
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>

      {adding && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="flex-1 min-w-[8rem] bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground" />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="flex-[2] min-w-[10rem] bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground" />
          <button onClick={add} className="rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted">Save</button>
        </div>
      )}

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {links.map((l) => {
          const Icon = ICONS[l.icon] ?? ExternalLink;
          return (
            <li key={l.id} className="group relative">
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-foreground/80">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">{l.name}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{new URL(l.url).hostname.replace(/^www\./, "")}</span>
                </span>
              </a>
              <button
                onClick={() => remove(l.id)}
                aria-label={`Remove ${l.name}`}
                className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
