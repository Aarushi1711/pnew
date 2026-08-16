export function AdaptivePathVisual() {
  const nodes = [
    { label: 'Array Basics', state: 'done' },
    { label: 'Two Pointers', state: 'active' },
    { label: 'Arrays + Two Pointers Mix', state: 'locked' },
  ];
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your path</span>
        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">Arrays track</span>
      </div>
      <ol className="space-y-2">
        {nodes.map((node, i) => (
          <li key={node.label} className="flex items-center gap-3">
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                node.state === 'done'
                  ? 'bg-success text-success-foreground'
                  : node.state === 'active'
                    ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {node.state === 'done' ? '✓' : i + 1}
            </span>
            <div
              className={`h-9 flex-1 rounded-lg px-3 text-sm font-medium leading-9 ${
                node.state === 'active'
                  ? 'bg-primary/10 text-foreground'
                  : node.state === 'locked'
                    ? 'bg-muted/60 text-muted-foreground'
                    : 'bg-card text-foreground/80'
              }`}
            >
              {node.label}
              {node.state === 'locked' && <span className="ml-2 text-xs font-normal">🔒 unlocks with stars</span>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function HintLadderVisual() {
  const rungs = [
    { tier: 'Nudge', unlocked: true },
    { tier: 'Technique', unlocked: true },
    { tier: 'Pseudocode', unlocked: false },
  ];
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hint ladder</span>
        <span className="text-xs font-medium text-muted-foreground">2 / 3 used</span>
      </div>
      <div className="space-y-2">
        {rungs.map((rung) => (
          <div
            key={rung.tier}
            className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
              rung.unlocked
                ? 'border-primary/40 bg-primary/10 text-foreground'
                : 'border-dashed border-border bg-muted/40 text-muted-foreground'
            }`}
          >
            <span className="font-medium">{rung.tier}</span>
            <span aria-hidden="true">{rung.unlocked ? 'unlocked' : '🔒'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SquadVisual() {
  const friends = [
    { name: 'Mika', stage: 'Two Pointers', you: false },
    { name: 'You', stage: 'Array Basics', you: true },
    { name: 'Dev', stage: 'Array Basics', you: false },
  ];
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Squad progress</span>
        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">Arrays track</span>
      </div>
      <ul className="space-y-3">
        {friends.map((f) => (
          <li key={f.name} className="flex items-center gap-3">
            <span
              className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                f.you ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {f.name[0]}
            </span>
            <span className={`text-sm font-medium ${f.you ? 'text-foreground' : 'text-foreground/70'} w-12 shrink-0`}>
              {f.name}
            </span>
            <span className="flex-1 rounded-lg bg-muted px-3 py-1.5 text-sm text-foreground/80">
              currently on <span className="font-medium text-foreground">{f.stage}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MissionVisual() {
  const missions = [
    { label: 'Solve 3 distinct problems', done: 2, total: 3, reward: '+100 XP' },
    { label: 'Earn 5 stars in Array Basics', done: 3, total: 5, reward: '+150 XP' },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {missions.map((m) => (
        <div key={m.label} className="flex flex-col justify-between rounded-2xl border border-border bg-background/60 p-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="grid size-8 place-items-center rounded-lg bg-accent/15 text-base" aria-hidden="true">
                {m.done === m.total ? '🏆' : '🎯'}
              </span>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-foreground/80">
                {m.reward}
              </span>
            </div>
            <p className="text-sm font-medium leading-snug text-foreground">{m.label}</p>
          </div>
          <div className="mt-3">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${m.done === m.total ? 'bg-success' : 'bg-accent'}`}
                style={{ width: `${(m.done / m.total) * 100}%` }}
              />
            </div>
            <span className="mt-1.5 block text-xs font-medium text-muted-foreground">
              {m.done}/{m.total}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
