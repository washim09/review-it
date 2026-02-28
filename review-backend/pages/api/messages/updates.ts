// pages/api/messages/updates.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract and verify token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    // Use the same token structure as used in login.ts
    // The token contains userId field, not id
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as { userId: number };
    const userId = decoded.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token structure' });
    }

    // Fetch unread messages and recently updated messages
    const unreadMessages = await prisma.chatMessage.findMany({
      where: {
        recipientId: userId,
        isRead: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      unreadMessages,
      receipts: {
        read: [],
        delivered: []
      }
    });
  } catch (error) {
    console.error('Error in messages/updates:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}