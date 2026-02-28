// pages/api/messages/[id]/read.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Cors from 'cors';
import jwt from 'jsonwebtoken';
import { broadcastReadReceipt } from '../../events';

const prisma = new PrismaClient();
const cors = Cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  origin: '*', // Allow all origins for now to debug the issue
  credentials: true,
});

// Helper to run middleware
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
  // Run CORS middleware first
  await runMiddleware(req, res, cors);

  // Handle OPTIONS requests for preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Get the sender ID from the URL parameter
    const { id: senderId } = req.query;

    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify the token and extract the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    const userId = decoded.userId;

    // First, get all unread messages from this sender
    const unreadMessages = await prisma.chatMessage.findMany({
      where: {
        senderId: Number(senderId),
        recipientId: userId,
        isRead: false,
      },
      select: {
        id: true,
      },
    });
    
    // Extract message IDs
    const messageIds = unreadMessages.map(msg => msg.id);
    
    if (messageIds.length > 0) {
      // Mark all messages from the sender to the current user as read
      await prisma.chatMessage.updateMany({
        where: {
          id: { in: messageIds },
        },
        data: {
          isRead: true,
        },
      });
      
      // Try to broadcast read receipt to the sender
      try {
        // Make sure senderId is properly converted to a number
        const senderIdNum = Number(senderId);
        
        if (!isNaN(senderIdNum) && Array.isArray(messageIds) && messageIds.length > 0) {
          broadcastReadReceipt(senderIdNum, messageIds);
        } else {

        }
      } catch (error) {
        console.error('Error broadcasting read receipt:', error);
        // Continue despite broadcast error
      }
    }

    return res.status(200).json({ message: 'Messages marked as read', messageIds });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
