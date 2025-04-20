import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import allowCors from '../../cors';
import errorMiddleware from '../../middlewareError';

const prisma = new PrismaClient();
const secretKey = process.env.JWT_SECRET;

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const userId = parseInt(id as string);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Fetching reviews for user ID:', userId);

    // Verify token and get authenticated user
    let authenticatedUserId;
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, secretKey!) as { userId: number };
        authenticatedUserId = decoded.userId;
        console.log('Authenticated user ID:', authenticatedUserId);
      }
    } catch (e) {
      console.error('Token verification error:', e);
    }
    
    // Check if user is authorized to view these reviews
    // A user can view their own reviews or any public reviews
    const isAuthorized = authenticatedUserId === userId;
    if (!isAuthorized) {
      console.log('User not authorized to view these reviews');
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Fetch actual reviews from the database
    try {
      // Check the Prisma schema to find the correct field name for the user relationship
      // It might be 'authorId' instead of 'userId' depending on your schema
      const reviews = await prisma.review.findMany({
        where: {
          authorId: userId,  // Reviews created by this user (assuming the field is authorId)
          // If your schema uses a different field name, change it accordingly
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      console.log(`Found ${reviews.length} reviews for user ${userId}`);
      return res.status(200).json(reviews);
    } catch (error) {
      console.error('Database query error:', error);
      throw error; // Let the outer catch block handle this
    }
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return res.status(500).json({ error: 'Failed to fetch user reviews' });
  }
}

// Wrap with CORS and error handling middleware
export default allowCors(errorMiddleware(handler));
