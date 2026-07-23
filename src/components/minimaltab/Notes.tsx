import { useEffect, useRef, useState } from "react";
import { StickyNote, Pin, PinOff, Plus, Trash2 } from "lucide-react";

import { useLocalStorage } from "@/lib/minimaltab/storage";

type Todo = { id: string; text: string; done: boolean };
type Note = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  updated: number;
  todos?: Todo[];
};

export function Notes() {
  const [notes, setNotes] = useLocalStorage<Note[]>("mt.notes", []);
  const [activeId, setActiveId] = useState<string | null>(null);
  const listRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const titleRef = useRef<HTMLInputElement | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!activeId && notes.length) setActiveId(notes[0].id);
  }, [notes, activeId]);

  const active = notes.find((n) => n.id === activeId) ?? null;

  const create = () => {
    const n: Note = {
      id: crypto.randomUUID(),
      title: "Untitled",
      body: "",
      pinned: false,
      updated: Date.now(),
      todos: [],
    };
    setNotes([n, ...notes]);
    setActiveId(n.id);
    requestAnimationFrame(() => titleRef.current?.focus());
  };

  const update = (patch: Partial<Note>) => {
    if (!active) return;
    setNotes(notes.map((n) => (n.id === active.id ? { ...n, ...patch, updated: Date.now() } : n)));
  };

  const remove = (id: string) => {
    const next = notes.filter((n) => n.id !== id);
    setNotes(next);
    if (activeId === id) setActiveId(next[0]?.id ?? null);
  };

  const addTodo = () => {
    if (!active || !newTodo.trim()) return;
    const todos = [...(active.todos ?? []), { id: crypto.randomUUID(), text: newTodo.trim(), done: false }];
    update({ todos });
    setNewTodo("");
  };

  const toggleTodo = (tid: string) => {
    if (!active) return;
    const todos = (active.todos ?? []).map((t) => (t.id === tid ? { ...t, done: !t.done } : t));
    update({ todos });
  };

  const removeTodo = (tid: string) => {
    if (!active) return;
    update({ todos: (active.todos ?? []).filter((t) => t.id !== tid) });
  };

  const sorted = [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updated - a.updated);

  const onListKey = (e: React.KeyboardEvent, id: string) => {
    const idx = sorted.findIndex((n) => n.id === id);
    if (e.key === "ArrowDown" || e.key === "j") {
      e.preventDefault();
      const next = sorted[Math.min(sorted.length - 1, idx + 1)];
      if (next) {
        setActiveId(next.id);
        listRefs.current[next.id]?.focus();
      }
    } else if (e.key === "ArrowUp" || e.key === "k") {
      e.preventDefault();
      const prev = sorted[Math.max(0, idx - 1)];
      if (prev) {
        setActiveId(prev.id);
        listRefs.current[prev.id]?.focus();
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      setActiveId(id);
      titleRef.current?.focus();
    } else if (e.key === "Delete" && e.shiftKey) {
      e.preventDefault();
      remove(id);
    }
  };

  const onEditorKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      (e.target as HTMLElement).blur();
      if (active) listRefs.current[active.id]?.focus();
    }
  };

  return (
    <section aria-labelledby="notes-heading" className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 id="notes-heading" className="flex items-center gap-2 text-sm font-medium text-foreground">
          <StickyNote className="h-4 w-4 text-muted-foreground" /> Notes
        </h2>
        <button onClick={create} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <Plus className="h-3 w-3" /> New
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[10rem_minmax(0,1fr)]" style={{ minHeight: "16rem" }}>
        <ul
          role="listbox"
          aria-label="Notes"
          className="max-h-64 overflow-y-auto border-b border-border p-1 sm:max-h-none sm:border-b-0 sm:border-r"
        >
          {sorted.length === 0 && <li className="p-3 text-xs text-muted-foreground">No notes yet.</li>}
          {sorted.map((n) => (
            <li key={n.id}>
              <button
                ref={(el) => {
                  listRefs.current[n.id] = el;
                }}
                onClick={() => setActiveId(n.id)}
                onKeyDown={(e) => onListKey(e, n.id)}
                role="option"
                aria-selected={activeId === n.id}
                className={`flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                  activeId === n.id ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60"
                }`}
              >
                {n.pinned && <Pin className="h-3 w-3 shrink-0" />}
                <span className="min-w-0 flex-1 truncate">{n.title || "Untitled"}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="min-w-0 p-3">
          {active ? (
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <input
                  ref={titleRef}
                  value={active.title}
                  onChange={(e) => update({ title: e.target.value })}
                  onKeyDown={(e) => {
                    onEditorKey(e);
                    if (e.key === "Enter") {
                      e.preventDefault();
                      bodyRef.current?.focus();
                    }
                  }}
                  placeholder="Title"
                  className="min-w-0 flex-1 truncate bg-transparent text-base font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                />
                <button
                  onClick={() => update({ pinned: !active.pinned })}
                  aria-label={active.pinned ? "Unpin" : "Pin"}
                  className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {active.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => remove(active.id)}
                  aria-label="Delete note"
                  className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <textarea
                ref={bodyRef}
                value={active.body}
                onChange={(e) => update({ body: e.target.value })}
                onKeyDown={onEditorKey}
                placeholder="Write in markdown — auto-saved. Esc to return to list."
                className="mt-2 h-32 w-full resize-none bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
              />



              <p className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
                Auto-saved · {new Date(active.updated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          ) : (
            <div className="flex h-full min-h-[10rem] items-center justify-center text-center">
              <button onClick={create} className="text-sm text-muted-foreground hover:text-foreground">
                Create your first note
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
