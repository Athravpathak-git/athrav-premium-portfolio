import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export interface SeoProps {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export function constructMetadata({
  title = 'Athrav Pathak — Aspiring AI Engineer',
  description = 'Personal portfolio of Athrav Pathak, Aspiring AI Engineer pursuing BCA in second year. Explore machine learning projects, coursework credentials, and technical capabilities.',
  path = '',
  ogImage = '/images/og-preview.png',
  noIndex = false,
}: SeoProps = {}): Metadata {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  return {
    title: {
      default: title,
      template: '%s | Athrav Pathak',
    },
    description,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Athrav Pathak Portfolio',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function generatePersonJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Athrav Pathak',
    jobTitle: 'Aspiring AI Engineer',
    description:
      'Second-year Bachelor of Computer Applications (BCA) student dedicated to artificial intelligence, machine learning, and modern full-stack web architecture.',
    url: BASE_URL,
    sameAs: ['https://github.com/Athravpathak-git'],
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: 'Bachelor of Computer Applications (BCA)',
    },
    knowsAbout: [
      'Artificial Intelligence',
      'Machine Learning',
      'Python',
      'TypeScript',
      'Next.js',
      'React',
      'PostgreSQL',
      'Deep Learning Fundamentals',
    ],
  };
}
