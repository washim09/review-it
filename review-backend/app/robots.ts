import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/login',
          '/register',
          '/profile',
          '/message',
          '/admin/',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://riviewit.com/sitemap.xml',
  }
}