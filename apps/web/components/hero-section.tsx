import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 pt-16 md:pt-24">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground">
          <span className="grid size-5 place-items-center rounded-full bg-accent/15 text-xs" aria-hidden="true">
            {'⚡'}
          </span>
          Built for students who bounce off LeetCode
        </span>

        <h1 className="mt-6 text-balance font-display text-5xl font-extrabold leading-[1.02] text-foreground md:text-7xl">
          Grind data structures like it&apos;s a game worth beating
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          An adaptive coding-practice platform that hands you staged hints without spoiling the answer, and lets
          friends move through the same map together at their own pace.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            nativeButton={false}
            className="h-12 rounded-xl px-7 text-base font-semibold"
            render={<Link href="/login">Start your first mission</Link>}
          />
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            className="h-12 rounded-xl border-border bg-transparent px-7 text-base font-semibold"
            render={<a href="#features">See how it works</a>}
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
            No credit card needed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
            AI-generated staged hints
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
            Server-validated progress
          </span>
        </div>
      </div>
    </section>
  );
}
