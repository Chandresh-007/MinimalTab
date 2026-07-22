import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Flame, Target, Coffee, Zap } from "lucide-react";
import { useLocalStorage } from "@/lib/minimaltab/storage";

type Task = { id: string; text: string; done: boolean };

const PRESETS = [
  { id: "focus", label: "Focus", mins: 25, icon: Zap },
  { id: "deep", label: "Deep", mins: 50, icon: Target },
  { id: "break", label: "Break", mins: 5, icon: Coffee },
];

export function TodayFocus({ triggerStart }: { triggerStart: number }) {
  const [goal, setGoal] = useLocalStorage<string>("mt.goal", "");
  const [tasks, setTasks] = useLocalStorage<Task[]>("mt.tasks", []);
  const [streak] = useLocalStorage<number>("mt.streak", 1);
  const [presetId, setPresetId] = useState("focus");
  const preset = PRESETS.find((p) => p.id === presetId)!;
  const total = preset.mins * 60;
  const [seconds, setSeconds] = useState<number>(total);
  const [running, setRunning] = useState(false);
  const [newTask, setNewTask] = useState("");
  const ref = useRef<number | null>(null);

  // Reset timer whenever preset changes
  useEffect(() => {
    setRunning(false);
    setSeconds(preset.mins * 60);
  }, [presetId]);

  useEffect(() => {
    if (triggerStart > 0) { setSeconds(preset.mins * 60); setRunning(true); }
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

  const doneCount = tasks.filter((t) => t.done).length;
  const totalTasks = tasks.length;
  const score = totalTasks ? Math.round((doneCount / totalTasks) * 100) : 0;

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: crypto.randomUUID(), text: newTask.trim(), done: false }]);
    setNewTask("");
  };
  const toggle = (id: string) => setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id: string) => setTasks(tasks.filter((t) => t.id !== id));

  const progress = 1 - seconds / total;
  const R = 72;
  const circumference = 2 * Math.PI * R;

  return (
    <section aria-labelledby="today-heading" className="rounded-2xl border border-border bg-card/70 p-6 backdrop-blur">
      <div className="mb-5 flex items-center justify-between">
        <h2 id="today-heading" className="text-sm font-medium text-foreground">Today's focus</h2>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Flame className="h-3.5 w-3.5" /> {streak}-day streak
        </span>
      </div>

      {/* Preset pills */}
      <div className="mb-6 flex gap-1 rounded-full border border-border p-1">
        {PRESETS.map((p) => {
          const Icon = p.icon;
          const active = presetId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setPresetId(p.id)}
              className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                active ? "text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="preset-pill"
                  className="absolute inset-0 rounded-full bg-foreground"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon className="h-3 w-3" /> {p.label} · {p.mins}m
              </span>
            </button>
          );
        })}
      </div>

      {/* Big circular timer */}
      <div className="relative mx-auto mb-6 flex h-48 w-48 items-center justify-center">
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
          <circle cx="80" cy="80" r={R} strokeWidth="3" className="fill-none stroke-muted" />
          <circle
            cx="80" cy="80" r={R} strokeWidth="3"
            className="fill-none stroke-foreground transition-[stroke-dashoffset] duration-500 ease-out"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-mono text-4xl font-extralight tabular-nums tracking-tight text-foreground">
            {mm}:{ss}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {running ? "In flow" : "Ready"}
          </p>
        </div>
      </div>

      <div className="mb-6 flex justify-center gap-2">
        <button
          onClick={() => setRunning((r) => !r)}
          aria-label={running ? "Pause timer" : "Start timer"}
          className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-transform hover:scale-[1.03] active:scale-95"
        >
          {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {running ? "Pause" : "Start"}
        </button>
        <button
          onClick={() => { setRunning(false); setSeconds(preset.mins * 60); }}
          aria-label="Reset timer"
          className="rounded-full border border-border p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Goal */}
      <label className="flex items-start gap-2 border-t border-border pt-4">
        <Target className="mt-0.5 h-4 w-4 text-muted-foreground" />
        <input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="One thing you'll finish today…"
          className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>

      <p className="mt-3 text-[11px] text-muted-foreground">
        {doneCount}/{totalTasks} tasks · {score}% score
      </p>

      <div className="mt-3 space-y-1">
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
