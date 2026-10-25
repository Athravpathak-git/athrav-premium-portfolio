import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/public/ThemeProvider';
import { DevModeBanner } from '@/components/public/DevModeBanner';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { constructMetadata, generatePersonJsonLd } from '@/lib/seo';

export const metadata: Metadata = constructMetadata({
  title: 'Athrav Pathak — Aspiring AI Engineer',
  description:
    'Athrav Pathak is an aspiring AI engineer pursuing BCA in second year. Explore intelligent machine learning projects, software architecture, coursework credentials, and technical capabilities.',
  path: '/',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = generatePersonJsonLd();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-black text-zinc-100 antialiased selection:bg-white/20 selection:text-white">
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <DevModeBanner />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
