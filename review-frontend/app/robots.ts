import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/message/', '/verify-email/', '/reset-password/', '/forgot-password/'],
      },
    ],
    sitemap: 'https://riviewit.com/sitemap.xml',
  }
}
