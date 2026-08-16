import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';

export function CtaSection() {
  return (
    <Reveal as="section" className="mx-auto block max-w-6xl px-5 py-16 md:py-24" id="squad">
      <div className="relative overflow-hidden rounded-[2rem] border border-border bg-primary px-6 py-14 text-center md:px-12 md:py-20">
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-balance font-display text-4xl font-extrabold leading-[1.05] text-primary-foreground md:text-5xl">
            Bring your squad. Move at your own pace. Actually enjoy DSA.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-pretty text-lg leading-relaxed text-primary-foreground/80">
            Start your first mission today, free — no credit card, no rankings, just real progress.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              nativeButton={false}
              className="h-12 rounded-xl bg-accent px-7 text-base font-semibold text-accent-foreground hover:bg-accent/90"
              render={<Link href="/register">Create your account</Link>}
            />
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              className="h-12 rounded-xl border-primary-foreground/30 bg-transparent px-7 text-base font-semibold text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              render={<Link href="/login">Log in</Link>}
            />
          </div>
        </div>
      </div>
    </Reveal>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-primary font-display text-base font-extrabold text-primary-foreground">
            {'{'}
          </span>
          <span className="font-display text-base font-bold text-foreground">Traverse</span>
        </div>
        <p className="text-sm text-muted-foreground">Built for students who&apos;d rather play than grind.</p>
      </div>
    </footer>
  );
}
