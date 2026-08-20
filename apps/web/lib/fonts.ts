import { Bricolage_Grotesque, Geist } from 'next/font/google';

// Shared across the landing page and the auth pages (login/register) so all
// three visually match. Each next/font call is deduped by Next.js per unique
// config, so importing these instances from multiple pages is safe.
export const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-landing-display',
  weight: ['500', '600', '700', '800'],
});

export const geist = Geist({
  subsets: ['latin'],
  variable: '--font-landing-body',
});
