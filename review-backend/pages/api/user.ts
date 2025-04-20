// pages/api/user.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import Cors from 'cors';
import errorMiddleware from './middlewareError'; // Import the error handler

const prisma = new PrismaClient();
const secretKey = process.env.JWT_SECRET; // Get from env

// Initialize CORS middleware
const cors = Cors({
  methods: ['GET', 'OPTIONS'], // Add OPTIONS
  origin: ['http://localhost:5173', 'http://localhost:5174']
});

// Helper to run middleware
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
async function handler(req: NextApiRequest, res: NextApiResponse) {
  let userData = null;
  await runMiddleware(req, res, cors);
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
      return res.status(200).end();
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if it's a stats request
  const isStatsRequest = req.url?.includes('/stats/');

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, secretKey!) as { userId: number };
    const userId = decoded.userId;

    if (isStatsRequest) {
      const targetUserId = parseInt(req.url?.split('/stats/')[1] || '', 10);
      if (isNaN(targetUserId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      const stats = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: {
          _count: {
            select: {
              reviews: true,
              sentMessages: true,
              receivedMessages: true
            }
          }
        }
      });

      if (!stats) {
        return res.status(404).json({ error: 'User stats not found' });
      }

      if (!stats) {
        return res.status(404).json({ error: 'User stats not found' });
      }

      const counts = stats?._count || { reviews: 0, sentMessages: 0, receivedMessages: 0 };
      return res.status(200).json({
        reviews: counts.reviews || 0,
        sentMessages: counts.sentMessages || 0,
        receivedMessages: counts.receivedMessages || 0,
        totalMessages: (counts.sentMessages || 0) + (counts.receivedMessages || 0)
      });
    } else {
      userData = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          contact: true,
          address: true,
          city: true,
          state: true,
          instagram: true,
          facebook: true,
          twitter: true,
        },
      });
    }

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(userData);
  } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
          return res.status(401).json({ error: 'Token expired' });
      } else if (error instanceof jwt.JsonWebTokenError) {
          return res.status(401).json({ error: 'Invalid token' });
      }
      console.error('Authentication error:', error);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}
import allowCors from './cors';

export default allowCors(errorMiddleware(handler)); // Now the handler is wrapped by the errorMiddleware