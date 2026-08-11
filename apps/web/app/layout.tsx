import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from './auth-context';

export const metadata: Metadata = {
  title: 'DSA Platform (dev)',
  description: 'Frontend/backend plumbing check',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
