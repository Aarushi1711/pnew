const MAX_STARS = 3;

export function StarRow({ earned, size = 16 }: { earned: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${earned} of ${MAX_STARS} stars`}>
      {Array.from({ length: MAX_STARS }, (_, i) => (
        <StarIcon key={i} filled={i < earned} size={size} />
      ))}
    </div>
  );
}

export function StarIcon({ filled, size }: { filled: boolean; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      className={filled ? 'text-accent' : 'text-muted-foreground/40'}
      aria-hidden="true"
    >
      <path d="M12 2.5l2.95 6.53 7.05.79-5.3 4.86 1.5 6.98L12 17.9l-6.2 3.76 1.5-6.98-5.3-4.86 7.05-.79z" />
    </svg>
  );
}
