export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://athravpathak.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
