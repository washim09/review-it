import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Cors from 'cors';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Initialize the CORS middleware
const cors = Cors({
  methods: ['GET', 'PUT', 'DELETE', 'OPTIONS'],
  origin: ['https://riviewit.com', 'https://www.riviewit.com', 'https://admin.riviewit.com', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
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

const JWT_SECRET = process.env.JWT_SECRET || '54b6b0d3a9a1d639b0797cac96e96623c832ca5952bcc12449604c98d59c08cf22edec3379e0203564346c68dc7e9dc16905e4328e3d65c7e6a53f743401dd44';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Run the CORS middleware
  await runMiddleware(req, res, cors);

  // Handle OPTIONS requests (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract the review ID from the URL
  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid review ID' });
  }

  const reviewId = parseInt(id);
  if (isNaN(reviewId)) {
    return res.status(400).json({ error: 'Review ID must be a number' });
  }

  // All endpoints here require admin authentication
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    
    // Ensure the user is an admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // GET request - retrieve a specific review
    if (req.method === 'GET') {
      try {
        const review = await prisma.review.findUnique({
          where: { id: reviewId },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                imageUrl: true
              },
            },
          },
        });

        if (!review) {
          return res.status(404).json({ error: 'Review not found' });
        }

        return res.status(200).json(review);
      } catch (error) {
        console.error('Error fetching review:', error);
        return res.status(500).json({ error: 'Failed to fetch review' });
      }
    }
    
    // PUT request - update a specific review
    else if (req.method === 'PUT') {
      try {
        const updatedReview = await prisma.review.update({
          where: { id: reviewId },
          data: req.body,
        });

        return res.status(200).json(updatedReview);
      } catch (error) {
        console.error('Failed to update review:', error);
        return res.status(500).json({ error: 'Failed to update review' });
      }
    }
    
    // DELETE request - delete a specific review
    else if (req.method === 'DELETE') {
      try {
        await prisma.review.delete({
          where: { id: reviewId },
        });

        return res.status(200).json({ message: 'Review deleted successfully' });
      } catch (error) {
        console.error('Failed to delete review:', error);
        return res.status(500).json({ error: 'Failed to delete review' });
      }
    }
    
    // Method not allowed
    else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Invalid token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}
