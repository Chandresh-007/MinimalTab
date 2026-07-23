import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export function WelcomeDialog({
  open,
  onSubmit,
  onSkip,
}: {
  open: boolean;
  onSubmit: (name: string) => void;
  onSkip: () => void;
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSkip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onSkip]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Welcome">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-md" />
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-2xl">
        <div className="flex justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background">
            <Sparkles className="h-5 w-5" />
          </span>
        </div>
        <h2 className="mt-5 text-center text-2xl font-semibold tracking-tight">Welcome to MinimalTab</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          What should we call you? We'll use it to greet you every time you open a new tab.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none transition-colors focus:border-foreground/30"
            aria-label="Your name"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="w-full rounded-xl bg-foreground py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Continue
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="w-full rounded-xl py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
}
