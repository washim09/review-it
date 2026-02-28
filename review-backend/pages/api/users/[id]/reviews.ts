import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import Cors from 'cors';

const prisma = new PrismaClient();

// Initialize the CORS middleware
const cors = Cors({
  methods: ['GET', 'POST', 'OPTIONS'],
  origin: ['https://riviewit.com', 'https://www.riviewit.com', 'https://admin.riviewit.com', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
});

// Helper function to run middleware
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

// Helper to log request details for debugging
function logRequest(req: NextApiRequest) {

}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Log request details for debugging
  logRequest(req);

  try {
    // Run the CORS middleware
    await runMiddleware(req, res, cors);

    // Handle OPTIONS requests (preflight)
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Get the user ID from the URL
    const userId = Number(req.query.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Verify JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    let decodedToken;
    
    try {
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
      decodedToken = jwt.verify(token, JWT_SECRET) as { userId: number };
    } catch (err) {
      console.error('Token verification failed:', err);
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if the authenticated user is the same as the requested user or is an admin
    // This is a basic permission check - you can expand this based on your app's requirements
    if (decodedToken.userId !== userId) {
      // If you have admin roles, you can add a check here to allow admins to access any user's reviews
      // For now, we'll only allow users to access their own reviews
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.method === 'GET') {
      // Fetch user reviews
      const reviews = await prisma.review.findMany({
        where: { authorId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
        },
      });

      // Map the reviews to a simpler format for the client
      const formattedReviews = reviews.map(review => ({
        id: review.id,
        title: review.title,
        content: review.content,
        rating: review.rating,
        createdAt: review.createdAt,
        productName: review.entity || 'Unknown Product', // Using entity field as productName
        imageUrl: review.imageUrl,
        videoUrl: review.videoUrl,
        tags: review.tags,
        author: {
          id: review.author.id,
          name: review.author.name,
          imageUrl: review.author.imageUrl
        },
        review: review.review, // Including the review field 
      }));

      return res.status(200).json(formattedReviews);
    }

    // Return 405 Method Not Allowed for any other HTTP methods
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling user reviews request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
