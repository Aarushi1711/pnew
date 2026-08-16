import {
  AdaptivePathVisual,
  HintLadderVisual,
  SquadVisual,
  MissionVisual,
} from '@/components/feature-visuals';
import { Reveal } from '@/components/reveal';

type Feature = {
  id: string;
  tag: string;
  title: string;
  description: string;
  bullets: string[];
  visual: React.ReactNode;
  span: 'wide' | 'narrow';
};

const features: Feature[] = [
  {
    id: 'adaptive',
    tag: 'Journey map',
    title: 'A learning path that reads the room',
    description:
      'Stages unlock as you earn stars solving real problems, so the next challenge is always one you\'re actually ready for.',
    bullets: ['Star-gated stage unlocks', 'Solve-based, not time-based', 'No two journeys alike'],
    visual: <AdaptivePathVisual />,
    span: 'wide',
  },
  {
    id: 'hints',
    tag: 'Staged hints',
    title: 'Hints that teach, not spoil',
    description:
      "Stuck? Unlock help one rung at a time — a general nudge, then the named technique, then a near-pseudocode walkthrough — so you keep the aha moment.",
    bullets: ['3-stage reveal', 'Never the full solution'],
    visual: <HintLadderVisual />,
    span: 'narrow',
  },
  {
    id: 'squad',
    tag: 'Squad mode',
    title: 'Move through it with your crew',
    description:
      'Friends move through the same map at their own pace and can see each other\'s real progress — no rankings, no competition, just shared momentum.',
    bullets: ['See real progress, not scores', 'Everyone moves at their own pace'],
    visual: <SquadVisual />,
    span: 'narrow',
  },
  {
    id: 'missions',
    tag: 'Missions',
    title: 'Every grind earns something real',
    description:
      "Missions award XP based on real, server-validated criteria — like solving a set number of problems or earning enough stars in a stage. No gimmicks, just progress that's actually checked.",
    bullets: ['Solve-count criteria', 'Stage-star criteria', 'Server-validated XP'],
    visual: <MissionVisual />,
    span: 'wide',
  },
];

export function FeaturesSection() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-20 md:py-28">
      <Reveal as="section" className="mx-auto max-w-2xl text-center">
        <header>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
            Why students actually stick with it
          </span>
          <h2 className="mt-6 text-balance font-display text-4xl font-bold leading-[1.05] text-foreground md:text-5xl">
            Practice that feels less like homework, more like a game you want to win
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Everything below works together to keep you moving — learning, progressing, and unlocking more, one real
            solve at a time.
          </p>
        </header>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-5">
        {features.map((feature, index) => {
          const spanClass = feature.span === 'wide' ? 'md:col-span-3' : 'md:col-span-2';
          return (
            <Reveal key={feature.id} delay={index * 110} className={spanClass}>
              <FeatureCard feature={feature} />
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 transition-colors hover:border-primary/60 md:p-8">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground/90">
          <span className="text-foreground/80">{feature.tag}</span>
        </span>
      </div>

      <h3 className="mt-4 text-pretty font-display text-2xl font-semibold leading-tight text-foreground">
        {feature.title}
      </h3>
      <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{feature.description}</p>

      <ul className="mt-5 flex flex-wrap gap-2">
        {feature.bullets.map((bullet) => (
          <li
            key={bullet}
            className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-sm font-medium text-foreground/80"
          >
            <svg
              className="size-3.5 text-success"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              aria-hidden="true"
            >
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {bullet}
          </li>
        ))}
      </ul>

      <div className="mt-8 flex-1">{feature.visual}</div>
    </article>
  );
}
