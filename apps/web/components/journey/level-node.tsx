import { cn } from '@/lib/utils';
import { LockIcon } from './lock-icon';
import { StarRow } from './star-row';

interface LevelNodeProps {
  index: number;
  starsEarned: number;
  hasMorePractice: boolean;
  // A Level has no independent unlock rule in the data model -- it inherits
  // its parent Stage's locked state (always false here, since locked Stages
  // never expand to reveal their Levels). Accepted as a real prop rather
  // than hardcoded so the component stays honest if that ever changes.
  locked: boolean;
  pending: boolean;
  onClick: () => void;
}

export function LevelNode({ index, starsEarned, hasMorePractice, locked, pending, onClick }: LevelNodeProps) {
  const clickable = !locked && hasMorePractice && !pending;

  return (
    <button
      type="button"
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors',
        clickable && 'cursor-pointer hover:border-primary/60',
        !clickable && !locked && 'cursor-default',
        locked && 'cursor-not-allowed opacity-50',
      )}
    >
      <div className="flex items-center gap-2">
        {locked && <LockIcon size={14} />}
        <span className="text-sm font-medium text-foreground">Level {index}</span>
      </div>
      <div className="flex items-center gap-3">
        {hasMorePractice && !locked && (
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
            {pending ? 'Loading...' : 'More practice'}
          </span>
        )}
        <StarRow earned={starsEarned} size={14} />
      </div>
    </button>
  );
}
