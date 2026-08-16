import { Reveal } from '@/components/reveal';

// Deliberately NOT fabricated usage/retention numbers (this is a pre-launch
// product with no real user base yet) — these are honest, verifiable facts
// about how the built system actually works.
const stats = [
  { value: '3', label: 'staged hint levels per problem, never the full solution' },
  { value: '100%', label: 'server-validated — XP and unlocks are never just client-side' },
  { value: '0', label: 'fake rankings, streak gimmicks, or loot boxes' },
];

export function StatsBand() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <div className="grid grid-cols-1 gap-4 rounded-3xl border border-border bg-card p-6 sm:grid-cols-3 md:p-8">
        {stats.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 120} className="text-center">
            <div className="font-display text-4xl font-extrabold text-foreground md:text-5xl">{stat.value}</div>
            <p className="mx-auto mt-2 max-w-[16rem] text-pretty text-sm leading-relaxed text-muted-foreground">
              {stat.label}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
