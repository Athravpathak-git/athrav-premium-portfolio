import './globals.css';
import Navbar from '@/components/Navbar.jsx';
import Footer from '@/components/Footer.jsx';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://athravpathak.com';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Athrav Pathak — Software Engineer & Systems Architect',
    template: '%s | Athrav Pathak',
  },
  description:
    'Production portfolio of Athrav Pathak. Full-stack software engineering, PostgreSQL database architecture, distributed systems, and refined Apple-inspired digital experiences.',
  keywords: [
    'Athrav Pathak',
    'Software Engineer',
    'Full Stack Engineer',
    'PostgreSQL Engineer',
    'Next.js Developer',
    'Systems Architect',
    'Three.js Developer',
  ],
  authors: [{ name: 'Athrav Pathak', url: siteUrl }],
  creator: 'Athrav Pathak',
  publisher: 'Athrav Pathak',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Athrav Pathak — Software Engineer & Systems Architect',
    description:
      'Production portfolio of Athrav Pathak. Full-stack software engineering, PostgreSQL database architecture, distributed systems, and refined Apple-inspired digital experiences.',
    url: siteUrl,
    siteName: 'Athrav Pathak Portfolio',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Athrav Pathak — Software Engineer & Systems Architect',
    description:
      'Production portfolio of Athrav Pathak. Full-stack software engineering, PostgreSQL database architecture, distributed systems, and refined Apple-inspired digital experiences.',
    creator: '@AthravPathak',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport = {
  themeColor: '#050508',
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Athrav Pathak',
  jobTitle: 'Full-Stack Software Engineer & Systems Architect',
  url: siteUrl,
  sameAs: [
    'https://github.com/Athravpathak-git',
    'https://www.linkedin.com/in/athrav-pathak-ai/',
  ],
  knowsAbout: [
    'PostgreSQL',
    'Full-Stack Development',
    'Next.js',
    'React',
    'Distributed Systems',
    'Prisma ORM',
    'Three.js',
    'Software Architecture',
    'Tailwind CSS',
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#050508] text-slate-100 selection:bg-slate-700 selection:text-white flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

