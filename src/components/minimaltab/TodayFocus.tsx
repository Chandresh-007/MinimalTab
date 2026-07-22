import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Flame, Target } from "lucide-react";
import { useLocalStorage } from "@/lib/minimaltab/storage";

type Task = { id: string; text: string; done: boolean };

const POMODORO = 25 * 60;

export function TodayFocus({ triggerStart }: { triggerStart: number }) {
  const [goal, setGoal] = useLocalStorage<string>("mt.goal", "");
  const [tasks, setTasks] = useLocalStorage<Task[]>("mt.tasks", []);
  const [streak] = useLocalStorage<number>("mt.streak", 1);
  const [seconds, setSeconds] = useState<number>(POMODORO);
  const [running, setRunning] = useState(false);
  const [newTask, setNewTask] = useState("");
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (triggerStart > 0) { setSeconds(POMODORO); setRunning(true); }
  }, [triggerStart]);

  useEffect(() => {
    if (!running) return;
    ref.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) { setRunning(false); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => { if (ref.current) window.clearInterval(ref.current); };
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const done = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const score = total ? Math.round((done / total) * 100) : 0;

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: crypto.randomUUID(), text: newTask.trim(), done: false }]);
    setNewTask("");
  };
  const toggle = (id: string) => setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id: string) => setTasks(tasks.filter((t) => t.id !== id));

  const progress = 1 - seconds / POMODORO;
  const circumference = 2 * Math.PI * 28;

  return (
    <section aria-labelledby="today-heading" className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="today-heading" className="text-sm font-medium text-foreground">Today's focus</h2>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Flame className="h-3.5 w-3.5" /> {streak}-day streak
        </span>
      </div>

      <label className="flex items-start gap-2">
        <Target className="mt-1 h-4 w-4 text-muted-foreground" />
        <input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="What's the one thing you'll finish today?"
          className="flex-1 bg-transparent text-[15px] font-medium text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>

      <div className="mt-5 flex items-center gap-4">
        <svg viewBox="0 0 64 64" className="h-16 w-16">
          <circle cx="32" cy="32" r="28" strokeWidth="4" className="fill-none stroke-muted" />
          <circle
            cx="32" cy="32" r="28" strokeWidth="4"
            className="fill-none stroke-foreground transition-[stroke-dashoffset] duration-150"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            transform="rotate(-90 32 32)"
          />
        </svg>
        <div className="flex-1">
          <p className="font-mono text-3xl font-light tabular-nums">{mm}:{ss}</p>
          <p className="text-xs text-muted-foreground">Pomodoro · {done}/{total} tasks · {score}% score</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setRunning((r) => !r)}
            aria-label={running ? "Pause timer" : "Start timer"}
            className="rounded-lg border border-border p-2 text-foreground transition-colors hover:bg-muted"
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={() => { setRunning(false); setSeconds(POMODORO); }}
            aria-label="Reset timer"
            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-1">
        {tasks.map((t) => (
          <div key={t.id} className="group flex items-center gap-2 rounded-md px-1 py-1">
            <button
              onClick={() => toggle(t.id)}
              aria-label={t.done ? "Mark incomplete" : "Mark complete"}
              className={`h-4 w-4 shrink-0 rounded-[5px] border transition-colors ${t.done ? "border-foreground bg-foreground" : "border-border hover:border-foreground/40"}`}
            >
              {t.done && <svg viewBox="0 0 12 12" className="h-full w-full text-background"><path d="M2.5 6.5l2.5 2.5 4.5-5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </button>
            <span className={`flex-1 text-sm ${t.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{t.text}</span>
            <button onClick={() => remove(t.id)} className="text-xs text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100">Remove</button>
          </div>
        ))}
        <form onSubmit={addTask}>
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a task…"
            className="w-full bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground"
          />
        </form>
      </div>
    </section>
  );
}
