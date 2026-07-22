import { useEffect, useRef, useState } from "react";
import { Plus, X, ExternalLink, GripVertical, Upload, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { DEFAULT_LINKS, ICONS, type QuickLink } from "@/lib/minimaltab/links";
import { useLocalStorage } from "@/lib/minimaltab/storage";

const TOP_SITES_KEY = "mt.topsites";

export function QuickAccess() {
  const [links, setLinks] = useLocalStorage<QuickLink[]>("mt.quicklinks", DEFAULT_LINKS);
  const [topSites, setTopSites] = useLocalStorage<Record<string, number>>(TOP_SITES_KEY, {});
  const [adding, setAdding] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number; label: string } | null>(null);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const listRef = useRef<HTMLUListElement | null>(null);
  const autoScrollRaf = useRef<number | null>(null);
  const scrollVel = useRef(0);

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

  const trackClick = (link: QuickLink) => {
    setTopSites((prev) => ({ ...prev, [link.url]: (prev[link.url] ?? 0) + 1 }));
  };

  const sortedTopSites = Object.entries(topSites)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([url]) => {
      const link = links.find((l) => l.url === url);
      return link ? { name: link.name, url } : { name: new URL(url).hostname.replace(/^www\./, ""), url };
    });

  const parseImport = (text: string): { name: string; url: string }[] => {
    const results: { name: string; url: string }[] = [];
    // Netscape HTML export
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    const anchors = doc.querySelectorAll("a[href]");
    anchors.forEach((a) => {
      const href = a.getAttribute("href");
      if (href && /^https?:\/\//i.test(href)) {
        results.push({ name: a.textContent?.trim() || new URL(href).hostname, url: href });
      }
    });
    // Plain URLs fallback
    if (results.length === 0) {
      const urls = text.match(/https?:\/\/[^\s]+/gi) || [];
      urls.forEach((u) => {
        try {
          results.push({ name: new URL(u).hostname.replace(/^www\./, ""), url: u });
        } catch {
          /* ignore */
        }
      });
    }
    return results.slice(0, 20);
  };

  const runImport = () => {
    const items = parseImport(importText);
    if (items.length === 0) return;
    const next = [
      ...links,
      ...items.map((item) => ({
        id: crypto.randomUUID(),
        name: item.name,
        url: item.url,
        icon: "chat" as const,
      })),
    ];
    setLinks(next);
    setImportText("");
    setImportOpen(false);
  };

  // ---------- Pointer-based drag (touch + mouse friendly) ----------
  const stopAutoScroll = () => {
    if (autoScrollRaf.current) {
      cancelAnimationFrame(autoScrollRaf.current);
      autoScrollRaf.current = null;
    }
    scrollVel.current = 0;
  };

  const tickAutoScroll = () => {
    if (scrollVel.current !== 0) {
      window.scrollBy(0, scrollVel.current);
    }
    autoScrollRaf.current = requestAnimationFrame(tickAutoScroll);
  };

  const updateAutoScroll = (clientY: number) => {
    const margin = 80;
    const maxSpeed = 14;
    const h = window.innerHeight;
    if (clientY < margin) {
      scrollVel.current = -Math.round(((margin - clientY) / margin) * maxSpeed);
    } else if (clientY > h - margin) {
      scrollVel.current = Math.round(((clientY - (h - margin)) / margin) * maxSpeed);
    } else {
      scrollVel.current = 0;
    }
    if (!autoScrollRaf.current && scrollVel.current !== 0) {
      autoScrollRaf.current = requestAnimationFrame(tickAutoScroll);
    }
  };

  const findItemIdAt = (x: number, y: number): string | null => {
    const list = listRef.current;
    if (!list) return null;
    const items = list.querySelectorAll<HTMLLIElement>("li[data-id]");
    for (const el of items) {
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        return el.getAttribute("data-id");
      }
    }
    return null;
  };

  const startPointerDrag = (e: React.PointerEvent, id: string, label: string) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    setDragId(id);
    setGhost({ x: e.clientX, y: e.clientY, label });

    const onMove = (ev: PointerEvent) => {
      setGhost({ x: ev.clientX, y: ev.clientY, label });
      const overIdNow = findItemIdAt(ev.clientX, ev.clientY);
      setOverId(overIdNow);
      updateAutoScroll(ev.clientY);
    };
    const onUp = (ev: PointerEvent) => {
      const target = findItemIdAt(ev.clientX, ev.clientY);
      if (target && target !== id) reorder(id, target);
      setDragId(null);
      setOverId(null);
      setGhost(null);
      stopAutoScroll();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  useEffect(() => stopAutoScroll, []);

  return (
    <section aria-labelledby="quick-access-heading">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 id="quick-access-heading" className="text-sm font-medium text-foreground">
          Quick access
        </h2>
        <div className="flex items-center gap-3">
          <span className="hidden text-[10px] uppercase tracking-wider text-muted-foreground sm:inline">
            Drag handle · Alt + ← →
          </span>
          <button
            onClick={() => setImportOpen((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Upload className="h-3 w-3" /> Import
          </button>
          <button
            onClick={() => setAdding((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
      </div>

      {sortedTopSites.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Clock className="h-3 w-3" /> Top sites
          </span>
          {sortedTopSites.map((site) => (
            <a
              key={site.url}
              href={site.url}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackClick({ url: site.url } as QuickLink)}
              className="rounded-full border border-border bg-background/60 px-2.5 py-0.5 text-xs text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
            >
              {site.name}
            </a>
          ))}
        </div>
      )}

      {importOpen && (
        <div className="mb-3 rounded-xl border border-border bg-card p-3">
          <p className="mb-2 text-xs text-muted-foreground">Paste a Netscape HTML bookmark export or a list of URLs.</p>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="<A HREF=\"...\">...</A> or https://..."
            className="h-24 w-full resize-none rounded-lg border border-border bg-transparent p-2 text-xs outline-none placeholder:text-muted-foreground"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={() => setImportOpen(false)} className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
              Cancel
            </button>
            <button onClick={runImport} className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
              Import
            </button>
          </div>
        </div>
      )}

      {adding && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="min-w-[8rem] flex-1 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            className="min-w-[10rem] flex-[2] bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
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
        ref={listRef}
        role="list"
        aria-label="Quick access links — drag the handle to reorder, or Alt with arrow keys"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5"
      >
        {links.map((l, i) => {
          const Icon = ICONS[l.icon] ?? ExternalLink;
          const isDragging = dragId === l.id;
          const isOver = overId === l.id && dragId !== l.id;
          return (
            <motion.li
              key={l.id}
              data-id={l.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: isDragging ? 0.4 : 1, y: isOver ? -2 : 0 }}
              transition={{ duration: 0.2, delay: i * 0.02 }}
              className="group relative"
            >
              <a
                ref={(el) => {
                  itemRefs.current[l.id] = el;
                }}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                onKeyDown={(e) => onKey(e, l.id)}
                onClick={(e) => {
                  if (dragId) e.preventDefault();
                  else trackClick(l);
                }}
                className={`flex items-center gap-2 rounded-2xl border border-border bg-card px-2.5 py-3 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.12)] ${
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
                <button
                  aria-label={`Drag ${l.name} to reorder`}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    startPointerDrag(e, l.id, l.name);
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground/70 opacity-100 transition-opacity hover:bg-muted hover:text-foreground active:cursor-grabbing sm:opacity-60 sm:group-hover:opacity-100"
                  style={{ touchAction: "none" }}
                >
                  <GripVertical className="h-4 w-4" />
                </button>
              </a>
              <button
                onClick={() => remove(l.id)}
                aria-label={`Remove ${l.name}`}
                className="absolute right-1 top-1 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.li>
          );
        })}
      </ul>

      {ghost && (
        <div
          className="pointer-events-none fixed z-50 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground shadow-lg"
          style={{ left: ghost.x + 12, top: ghost.y + 12 }}
        >
          {ghost.label}
        </div>
      )}
    </section>
  );
}
