// pages/api/reviews/featured.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { runCorsMiddleware } from '../../../lib/cors-middleware';

// Create a simple Prisma client
const prisma = new PrismaClient();

// Using centralized CORS middleware from ../cors-middleware.ts

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply the centralized CORS middleware
  await runCorsMiddleware(req, res);

  // Handle OPTIONS requests (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests for this public endpoint
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log the database connection attempt

    try {
      // Test database connection first

      await prisma.$connect();

    } catch (connError) {
      console.error('Database connection failed:', connError);
      
      // Provide more specific error message
      const errorMessage = connError instanceof Error ? connError.message : 'Unknown error';
      
      return res.status(500).json({ 
        error: 'Database connection failed', 
        details: errorMessage,
        troubleshooting: [
          'Make sure PostgreSQL service is running on your machine',
          'Check if the database server is accessible at localhost:5432',
          'Verify your database credentials in the .env file',
          'Try restarting the PostgreSQL service'
        ]
      });
    }

    // Get parameters with defaults
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 6;
    const rating = req.query.rating ? parseInt(req.query.rating as string, 10) : undefined;

    // Build query filters
    const whereClause: any = {};
    
    // Add rating filter if specified
    if (rating !== undefined) {
      whereClause.rating = rating;
    }
    
    // Fetch the top reviews based on rating
    const reviews = await prisma.review.findMany({
      take: limit,
      where: whereClause,
      select: {
        id: true,
        title: true,
        content: true,
        review: true,   // Detailed review text
        entity: true,   // Product/item name
        rating: true,
        createdAt: true,
        imageUrl: true,
        videoUrl: true,
        mediaUrls: true,
        tags: true,
        author: {
          select: {
            id: true,
            name: true,
            imageUrl: true
          },
        },
      },
      // Order by rating (highest first) and then by createdAt (newest first)
      orderBy: [
        { rating: 'desc' },
        { createdAt: 'desc' }
      ],
    });

    // Helper function to convert any value to a string array
    const toArray = (value: any): string[] => {
      if (!value) return [];
      if (Array.isArray(value)) return value.filter(x => typeof x === 'string' && x.trim());
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              return parsed.filter(x => typeof x === 'string' && x.trim());
            }
          } catch {
            // If parsing fails, treat as single URL
          }
        }
        return [trimmed];
      }
      return [];
    };

    // Merge legacy imageUrl and videoUrl into mediaUrls for frontend compatibility
    const reviewsWithMergedMedia = reviews.map((r: any) => {
      // Parse mediaUrls if it's a JSON string (from database JSON field)
      let parsedMediaUrls = r.mediaUrls;
      if (typeof r.mediaUrls === 'string') {
        try {
          parsedMediaUrls = JSON.parse(r.mediaUrls);
        } catch (e) {
          console.error('Failed to parse mediaUrls from DB:', e);
          parsedMediaUrls = [];
        }
      }
      
      // Ensure mediaUrls is always an array
      // Ensure mediaUrls is always an array
      let mergedMedia = Array.isArray(parsedMediaUrls) ? [...parsedMediaUrls] : [];

      // IMPORTANT: Only fallback to legacy fields if mediaUrls is empty.
      // Otherwise we will re-add deleted media from imageUrl/videoUrl and inflate carousel dots.
      if (mergedMedia.length === 0) {
        const imageList = toArray(r.imageUrl);
        for (const url of imageList) {
          if (!mergedMedia.includes(url)) mergedMedia.push(url);
        }

        const videoList = toArray(r.videoUrl);
        for (const url of videoList) {
          if (!mergedMedia.includes(url)) mergedMedia.push(url);
        }
      }

      return { ...r, mediaUrls: mergedMedia };
    });

    return res.status(200).json(reviewsWithMergedMedia);
  } catch (error) {
    console.error('Error fetching top reviews:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch top reviews',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    await prisma.$disconnect();
  }
}
