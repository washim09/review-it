// pages/api/loveMessages.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Cors from 'cors';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const cors = Cors({ methods: ['GET', 'PUT'] });

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
    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify the token and extract the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    const userId = decoded.userId;

    if (req.method === 'PUT') {
      // Mark all messages as read
      await prisma.chatMessage.updateMany({
        where: { recipientId: userId, isRead: false },
        data: { isRead: true },
      });

      return res.status(200).json({ message: 'Messages marked as read' });
    }

    // Fetch messages for the authenticated user as the recipient
    const messages = await prisma.chatMessage.findMany({
      where: { recipientId: userId },
      include: {
        review: {
          select: {
            id: true,
            entity: true,
            imageUrl: true,
          },
        },
        sender: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(
      messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        createdAt: msg.createdAt.toISOString(),
        isRead: msg.isRead,
        review: msg.review,
        sender: msg.sender,
      }))
    );
  } catch (error) {
    console.error('Messages API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}