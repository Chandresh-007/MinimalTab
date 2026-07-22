import { useRef, useState } from "react";
import { Plus, X, ExternalLink, GripVertical } from "lucide-react";
import { DEFAULT_LINKS, ICONS, type QuickLink } from "@/lib/minimaltab/links";
import { useLocalStorage } from "@/lib/minimaltab/storage";

export function QuickAccess() {
  const [links, setLinks] = useLocalStorage<QuickLink[]>("mt.quicklinks", DEFAULT_LINKS);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const add = () => {
    if (!name.trim() || !url.trim()) return;
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    setLinks([...links, { id: crypto.randomUUID(), name: name.trim(), url: href, icon: "chat" }]);
    setName("");
    setUrl("");
    setAdding(false);
  };

  const remove = (id: string) => setLinks(links.filter((l) => l.id !== id));

  const reorder = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const from = links.findIndex((l) => l.id === fromId);
    const to = links.findIndex((l) => l.id === toId);
    if (from < 0 || to < 0) return;
    const next = [...links];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setLinks(next);
  };

  const move = (id: string, delta: number) => {
    const from = links.findIndex((l) => l.id === id);
    const to = Math.max(0, Math.min(links.length - 1, from + delta));
    if (from === to) return;
    const next = [...links];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setLinks(next);
    // Keep focus on the moved card after reorder
    requestAnimationFrame(() => itemRefs.current[id]?.focus());
  };

  const focusSibling = (id: string, delta: number) => {
    const from = links.findIndex((l) => l.id === id);
    const to = Math.max(0, Math.min(links.length - 1, from + delta));
    itemRefs.current[links[to].id]?.focus();
  };

  const onKey = (e: React.KeyboardEvent, id: string) => {
    const alt = e.altKey || e.metaKey;
    if (alt && (e.key === "ArrowLeft" || e.key === "ArrowUp")) {
      e.preventDefault();
      move(id, -1);
    } else if (alt && (e.key === "ArrowRight" || e.key === "ArrowDown")) {
      e.preventDefault();
      move(id, 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      focusSibling(id, -1);
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      focusSibling(id, 1);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      if (e.shiftKey) {
        e.preventDefault();
        remove(id);
      }
    }
  };

  return (
    <section aria-labelledby="quick-access-heading">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 id="quick-access-heading" className="text-sm font-medium text-foreground">
          Quick access
        </h2>
        <div className="flex items-center gap-3">
          <span className="hidden text-[10px] uppercase tracking-wider text-muted-foreground sm:inline">
            Drag or Alt + ← →
          </span>
          <button
            onClick={() => setAdding((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
      </div>

      {adding && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="flex-1 min-w-[8rem] bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            className="flex-[2] min-w-[10rem] bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={add}
            className="rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted"
          >
            Save
          </button>
        </div>
      )}

      <ul
        role="list"
        aria-label="Quick access links — use Alt with arrow keys to reorder"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5"
      >
        {links.map((l) => {
          const Icon = ICONS[l.icon] ?? ExternalLink;
          const isDragging = dragId === l.id;
          const isOver = overId === l.id && dragId !== l.id;
          return (
            <li
              key={l.id}
              className={`group relative transition-transform ${isDragging ? "opacity-40" : ""} ${
                isOver ? "translate-y-[-2px]" : ""
              }`}
              onDragOver={(e) => {
                if (!dragId) return;
                e.preventDefault();
                setOverId(l.id);
              }}
              onDragLeave={() => {
                if (overId === l.id) setOverId(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragId) reorder(dragId, l.id);
                setDragId(null);
                setOverId(null);
              }}
            >
              <a
                ref={(el) => {
                  itemRefs.current[l.id] = el;
                }}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                draggable
                onDragStart={(e) => {
                  setDragId(l.id);
                  e.dataTransfer.effectAllowed = "move";
                  try {
                    e.dataTransfer.setData("text/plain", l.id);
                  } catch {
                    /* ignore */
                  }
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setOverId(null);
                }}
                onKeyDown={(e) => onKey(e, l.id)}
                aria-grabbed={isDragging}
                className={`flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] ${
                  isOver ? "border-foreground/40 ring-2 ring-foreground/10" : ""
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground/80">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">{l.name}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {new URL(l.url).hostname.replace(/^www\./, "")}
                  </span>
                </span>
                <GripVertical
                  aria-hidden
                  className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 opacity-0 transition-opacity group-hover:opacity-100"
                />
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
