import './globals.css';
import Navbar from '@/components/Navbar.jsx';
import Footer from '@/components/Footer.jsx';

export const metadata = {
  title: 'Athrav Pathak — Software Engineer & Systems Architect',
  description:
    'Production portfolio of Athrav Pathak. Full-stack software engineering, PostgreSQL database architecture, distributed systems, and refined Apple-inspired digital experiences.',
  keywords: [
    'Athrav Pathak',
    'Software Engineer',
    'Full Stack Engineer',
    'PostgreSQL Engineer',
    'Next.js Developer',
    'Systems Architect',
  ],
  authors: [{ name: 'Athrav Pathak' }],
  creator: 'Athrav Pathak',
  robots: {
    index: true,
    follow: true,
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
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
