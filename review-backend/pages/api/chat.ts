// review-backend/pages/api/chat.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Cors from 'cors';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const cors = Cors({ methods: ['POST', 'OPTIONS'] });

async function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, cors);

  try {
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'POST') {
      // Get the token from the Authorization header
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Verify the token and extract the sender's user ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
      const senderId = decoded.userId;

      // Extract the message data from the request body
      const { reviewId, content } = req.body;

      // Fetch the review to get the recipient's user ID (the review author)
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
        select: { authorId: true },
      });

      if (!review) {
        return res.status(404).json({ error: 'Review not found' });
      }

      const recipientId = review.authorId;

      // Create the chat message
      const newMessage = await prisma.chatMessage.create({
        data: {
          content,
          reviewId,
          senderId,
          recipientId,
        },
        include: {
          sender: true,
          recipient: true,
          review: true,
        },
      });

      return res.status(201).json(newMessage);
    }

    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}