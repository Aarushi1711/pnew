import { Button } from '@/components/ui/button';

export interface UnlockedHint {
  level: number;
  hintText: string;
}

// Mirrors the backend's actual cap (apps/api/src/ai/hints.service.ts:
// MAX_HINT_LEVEL). Used only to decide when to stop offering the button
// before making a request -- the server's `available:false` response is
// still the source of truth once a request is actually made.
const MAX_HINT_LEVEL = 3;

interface HintPanelProps {
  hints: UnlockedHint[];
  onRequestHint: () => void;
  loading: boolean;
  error: string | null;
}

export function HintPanel({ hints, onRequestHint, loading, error }: HintPanelProps) {
  const maxedOut = hints.length >= MAX_HINT_LEVEL;

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-semibold text-foreground">Hints</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {hints.length === 0
          ? "Stuck? Request a hint -- it starts with a gentle nudge, not the answer."
          : `${hints.length} of ${MAX_HINT_LEVEL} hints unlocked.`}
      </p>

      {hints.length > 0 && (
        <ol className="mt-4 flex flex-col gap-3">
          {hints.map((hint) => (
            <li key={hint.level} className="rounded-xl bg-muted/50 p-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Hint {hint.level}
              </span>
              <p className="mt-1 text-sm leading-relaxed text-foreground">{hint.hintText}</p>
            </li>
          ))}
        </ol>
      )}

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <div className="mt-4">
        {maxedOut ? (
          <p className="text-sm font-medium text-muted-foreground">No more hints for this problem.</p>
        ) : (
          <Button variant="outline" onClick={onRequestHint} disabled={loading} className="rounded-lg font-semibold">
            {loading ? 'Thinking...' : hints.length === 0 ? 'Get a hint' : 'Get next hint'}
          </Button>
        )}
      </div>
    </div>
  );
}
