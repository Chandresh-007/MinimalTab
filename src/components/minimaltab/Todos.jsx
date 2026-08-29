import { useState } from "react";
import { CheckSquare, Square, Plus, X, ListTodo, Trash2 } from "lucide-react";
import { useLocalStorage } from "@/lib/minimaltab/storage";
import { StarBorder } from "@/components/minimaltab/StarBorder";
function Todos() {
  const [todos, setTodos] = useLocalStorage("mt.todos", []);
  const [text, setText] = useState("");
  const add = () => {
    if (!text.trim()) return;
    setTodos([{ id: crypto.randomUUID(), text: text.trim(), done: false, created: Date.now() }, ...todos]);
    setText("");
  };
  const toggle = (id) => setTodos(todos.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const remove = (id) => setTodos(todos.filter((t) => t.id !== id));
  const clearDone = () => setTodos(todos.filter((t) => !t.done));
  const doneCount = todos.filter((t) => t.done).length;
  return <section aria-labelledby="todos-heading" className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 id="todos-heading" className="flex items-center gap-2 text-sm font-medium text-foreground">
          <ListTodo className="h-4 w-4 text-muted-foreground" /> To-do
          {todos.length > 0 && <span className="text-[10px] font-normal text-muted-foreground">
              {doneCount}/{todos.length}
            </span>}
        </h2>
        {doneCount > 0 && <StarBorder as="button" compact type="button" onClick={clearDone} data-spark>
            <Trash2 className="h-3 w-3" /> Clear done
          </StarBorder>}
      </div>
      <div className="p-3" style={{ minHeight: "16rem" }}>
        <div className="mb-3 flex items-center gap-2 rounded-md border border-border bg-background/60 px-2 py-1.5">
          <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
    value={text}
    onChange={(e) => setText(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        add();
      }
    }}
    placeholder="Add a task…"
    className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
  />
        </div>
        {todos.length === 0 ? <p className="p-3 text-xs text-muted-foreground">No tasks yet. Add one above.</p> : <ul className="space-y-1">
            {todos.map((t) => <li key={t.id} className="group flex min-w-0 items-center gap-2 rounded-md px-1 py-1 hover:bg-muted/40">
                <button
    onClick={() => toggle(t.id)}
    aria-label={t.done ? "Mark as not done" : "Mark as done"}
    className="shrink-0 text-muted-foreground hover:text-foreground"
  >
                  {t.done ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                </button>
                <span
    className={`min-w-0 flex-1 truncate text-sm ${t.done ? "text-muted-foreground line-through" : "text-foreground"}`}
  >
                  {t.text}
                </span>
                <button
    onClick={() => remove(t.id)}
    aria-label="Remove task"
    className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 hover:bg-muted hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100"
  >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>)}
          </ul>}
      </div>
    </section>;
}
export {
  Todos
};
