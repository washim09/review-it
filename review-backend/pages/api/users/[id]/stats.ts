// pages/api/users/[id]/stats.ts
import { NextApiRequest, NextApiResponse } from 'next';
import allowCors from '../../cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle preflight request (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Respond with 200 OK to preflight requests
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Validate Authorization Header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    // Verify JWT Token
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };

    // Validate User ID Parameter
    const userId = parseInt(req.query.id as string, 10); // Corrected: Use req.query.id
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    // Verify Token Owner Matches Requested User
    if (decoded.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    // Get total reviews received
    const receivedReviews = await prisma.review.findMany({
      where: {
        targetId: userId
      },
      select: {
        rating: true
      }
    });

    // Get total messages from reviews made
    const totalMessages = await prisma.chatMessage.count({
      where: {
        review: {
          authorId: userId
        }
      }
    });

    // Calculate Stats
    const totalReviews = receivedReviews.length;
    const averageRating = totalReviews > 0
      ? receivedReviews.reduce(
          (sum: number, review: { rating: number }) => sum + review.rating,
          0
        ) / totalReviews
      : 0;

    return res.status(200).json({
      totalReviews,
      averageRating: Number(averageRating.toFixed(1)),
      totalMessages,
    });
  } catch (error) {
    console.error('Stats Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null,
      timestamp: new Date().toISOString(),
    });

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Use CORS wrapper for all requests
export default allowCors(handler);