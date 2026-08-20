import type { Metadata } from 'next';
import { bricolage, geist } from '@/lib/fonts';
import { SiteNav } from '@/components/site-nav';
import { HeroSection } from '@/components/hero-section';
import { StatsBand } from '@/components/stats-band';
import { FeaturesSection } from '@/components/features-section';
import { CtaSection, SiteFooter } from '@/components/cta-footer';

// Fonts are loaded from lib/fonts (not the root layout) and scoped to this
// page's own wrapper div, so /login, /register, and /dashboard keep their
// existing default fonts untouched unless they opt in the same way.

export const metadata: Metadata = {
  title: 'Traverse — Learn algorithms by doing',
  description:
    'An adaptive DSA practice platform with staged hints, a journey map that unlocks with real progress, and squads that move together.',
};

export default function LandingPage() {
  return (
    <div className={`landing-root ${bricolage.variable} ${geist.variable} font-sans`}>
      <main className="min-h-screen bg-background font-sans text-foreground">
        <SiteNav />
        <HeroSection />
        <StatsBand />
        <div id="features">
          <FeaturesSection />
        </div>
        <CtaSection />
        <SiteFooter />
      </main>
    </div>
  );
}
