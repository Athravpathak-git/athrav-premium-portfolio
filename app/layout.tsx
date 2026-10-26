import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Playfair_Display } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/public/ThemeProvider';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { constructMetadata, generatePersonJsonLd } from '@/lib/seo';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = constructMetadata({
  title: 'Athrav Pathak — Creative Developer & AI Engineer',
  description:
    'Athrav Pathak is an aspiring AI engineer and creative developer pursuing BCA. Explore thoughtful digital experiences, machine learning projects, software architecture, and technical capabilities.',
  path: '/',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = generatePersonJsonLd();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans bg-cream text-charcoal antialiased selection:bg-burgundy/15 selection:text-burgundy">
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
