import { cn } from '@/lib/utils';
import { LockIcon } from './lock-icon';
import { StarIcon } from './star-row';

interface StageNodeProps {
  index: number;
  locked: boolean;
  starsEarned: number;
  maxStars: number;
  expanded: boolean;
  onClick: () => void;
}

export function StageNode({ index, locked, starsEarned, maxStars, expanded, onClick }: StageNodeProps) {
  return (
    <button
      type="button"
      onClick={!locked ? onClick : undefined}
      disabled={locked}
      aria-expanded={locked ? undefined : expanded}
      className={cn(
        'flex min-w-[128px] flex-col items-center gap-2 rounded-2xl border px-5 py-4 text-center transition-colors',
        locked && 'cursor-not-allowed border-border bg-muted opacity-60',
        !locked && expanded && 'cursor-pointer border-primary bg-primary/10',
        !locked && !expanded && 'cursor-pointer border-border bg-card hover:border-primary/60',
      )}
    >
      <div
        className={cn(
          'grid size-10 place-items-center rounded-full',
          locked ? 'bg-muted-foreground/15 text-muted-foreground' : 'bg-primary/15 text-primary',
        )}
      >
        {locked ? <LockIcon size={18} /> : <span className="font-display text-sm font-bold">{index}</span>}
      </div>
      <span className="text-sm font-semibold text-foreground">Mission {index}</span>
      {!locked && (
        <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <StarIcon filled size={12} />
          {starsEarned}/{maxStars}
        </span>
      )}
    </button>
  );
}
