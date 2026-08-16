import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-primary font-display text-lg font-extrabold text-primary-foreground">
            {'{'}
          </span>
          <span className="font-display text-lg font-bold text-foreground">Traverse</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#squad" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Squads
          </a>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            nativeButton={false}
            className="hidden h-9 rounded-lg font-medium sm:inline-flex"
            render={<Link href="/login">Log in</Link>}
          />
          <Button
            nativeButton={false}
            className="h-9 rounded-lg font-semibold"
            render={<Link href="/login">Get started</Link>}
          />
        </div>
      </nav>
    </header>
  );
}
