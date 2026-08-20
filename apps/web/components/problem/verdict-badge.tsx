import { cn } from '@/lib/utils';

export function VerdictBadge({ verdict }: { verdict: string }) {
  const isAccepted = verdict === 'Accepted';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold',
        isAccepted ? 'bg-success/15 text-success' : 'bg-destructive/10 text-destructive',
      )}
    >
      <span className={cn('size-1.5 rounded-full', isAccepted ? 'bg-success' : 'bg-destructive')} aria-hidden="true" />
      {verdict}
    </span>
  );
}
