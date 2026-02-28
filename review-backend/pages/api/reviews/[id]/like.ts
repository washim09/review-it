import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { runCorsMiddleware } from '../../../../lib/cors-middleware';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '54b6b0d3a9a1d639b0797cac96e96623c832ca5952bcc12449604c98d59c08cf22edec3379e0203564346c68dc7e9dc16905e4328e3d65c7e6a53f743401dd44';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apply CORS middleware
  await runCorsMiddleware(req, res);

  // Handle OPTIONS requests (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST and DELETE methods
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the review ID from the URL
    const { id } = req.query;
    const reviewId = parseInt(id as string, 10);

    if (isNaN(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }

    // Get the JWT token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    const userId = parseInt(decoded.userId || decoded.id || decoded.sub, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID in token' });
    }

    // Check if the review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (req.method === 'POST') {
      // Handle like
      try {
        // Check if the user has already liked the review
        const existingLike = await prisma.like.findFirst({
          where: {
            userId,
            reviewId,
          },
        });

        if (existingLike) {
          return res.status(200).json({ message: 'Already liked' });
        }

        // Create a new like
        await prisma.like.create({
          data: {
            userId,
            reviewId,
          },
        });

        // Get the updated like count
        const likeCount = await prisma.like.count({
          where: { reviewId },
        });

        return res.status(200).json({ 
          message: 'Review liked successfully',
          likeCount 
        });
      } catch (error) {
        console.error('Error liking review:', error);
        return res.status(500).json({ message: 'Failed to like review' });
      }
    } else if (req.method === 'DELETE') {
      // Handle unlike
      try {
        // Check if the user has liked the review
        const existingLike = await prisma.like.findFirst({
          where: {
            userId,
            reviewId,
          },
        });

        if (!existingLike) {
          return res.status(200).json({ message: 'Not liked yet' });
        }

        // Delete the like
        await prisma.like.delete({
          where: {
            id: existingLike.id,
          },
        });

        // Get the updated like count
        const likeCount = await prisma.like.count({
          where: { reviewId },
        });

        return res.status(200).json({ 
          message: 'Review unliked successfully',
          likeCount 
        });
      } catch (error) {
        console.error('Error unliking review:', error);
        return res.status(500).json({ message: 'Failed to unlike review' });
      }
    }
  } catch (error) {
    console.error('Error in like handler:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
