import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/about-us',
          '/blog',
          '/blog/*',
          '/contact',
          '/support',
          '/careers',
          '/privacy-policy',
          '/terms-of-service',
          '/cookie-policy',
          '/login',
          '/register',
        ],
        disallow: [
          '/api/',
          '/message/',
          '/message/*',
          '/verify-email',
          '/reset-password',
          '/forgot-password',
          '/profile',
          '/write-review',
          '/auth/callback',
        ],
      },
    ],
    sitemap: 'https://riviewit.com/sitemap.xml',
  }
}
