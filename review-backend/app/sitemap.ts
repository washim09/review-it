import { MetadataRoute } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all reviews from database
  const reviews = await prisma.review.findMany({
    select: {
      id: true,
      createdAt: true
    }
  })

  // Static pages - only SEO-friendly pages
  const staticPages = [
    {
      url: 'https://riviewit.com/',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: 'https://riviewit.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ]

  // Dynamic review pages
  const reviewPages = reviews.map((review) => ({
    url: `https://riviewit.com/review/${review.id}`,
    lastModified: review.createdAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...reviewPages]
}