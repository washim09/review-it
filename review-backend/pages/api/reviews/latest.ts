// pages/api/reviews/latest.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Cors from 'cors';

// Create a simple Prisma client with NO configuration options
const prisma = new PrismaClient();

// Initialize the CORS middleware with broader access
const cors = Cors({
  methods: ['GET', 'OPTIONS'],
  origin: '*', // Allow all origins for the public API
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
});

// Helper function to run the CORS middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Run the CORS middleware
  await runMiddleware(req, res, cors);

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
      return res.status(500).json({ 
        error: 'Database connection failed', 
        details: connError instanceof Error ? connError.message : 'Unknown error' 
      });
    }

    // Get limit parameter with default of 100 (so all reviews are typically shown)
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;

    // Fetch the latest reviews (public endpoint - no auth required)
    const reviews = await prisma.review.findMany({
      take: limit,
      select: {
        id: true,
        title: true,
        content: true,
        review: true,   // Added the review field to include detailed review text
        entity: true,   // Added entity field for product/item name
        rating: true,
        createdAt: true,
        imageUrl: true,
        videoUrl: true,
        mediaUrls: true, // Include mediaUrls array
        tags: true,
        author: {
          select: {
            id: true,
            name: true,
            imageUrl: true
          },
        },
      },
      orderBy: { createdAt: 'desc' },
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
    console.error('Error fetching latest reviews:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch latest reviews',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
