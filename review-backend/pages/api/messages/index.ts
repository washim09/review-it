import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const secretKey = process.env.JWT_SECRET;

// CORS middleware
const allowCors = (handler: any) => async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  return await handler(req, res);
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!secretKey) {
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    const decoded = jwt.verify(token, secretKey) as { userId: number };
    const userId = decoded.userId;

    // GET Request Handling
    if (req.method === 'GET') {
      if (req.query.type === 'unread-count') {
        const count = await prisma.chatMessage.count({
          where: { recipientId: userId, isRead: false }
        });
        return res.status(200).json(count);
      }

      const messages = await prisma.chatMessage.findMany({
        where: { OR: [{ senderId: userId }, { recipientId: userId }] },
        include: {
          sender: { select: { id: true, name: true, email: true } },
          recipient: { select: { id: true, name: true, email: true } },
          review: { select: { id: true, title: true, entity: true, imageUrl: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.status(200).json(messages);
    }

    // POST Request Handling
    if (req.method === 'POST') {
      const { content, recipientId, reviewId } = req.body;
      
      if (!content || !recipientId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const numericRecipientId = Number(recipientId);
      const numericReviewId = reviewId ? Number(reviewId) : null;

      const messageData: Prisma.ChatMessageCreateInput = {
        content,
        sender: { connect: { id: userId } },
        recipient: { connect: { id: numericRecipientId } },
        isRead: false,
        review: numericReviewId ? { connect: { id: numericReviewId } } : undefined
      };

      const message = await prisma.chatMessage.create({
        data: messageData,
        include: {
          sender: { select: { id: true, name: true, email: true } },
          recipient: { select: { id: true, name: true, email: true } },
          review: numericReviewId ? { 
            select: { id: true, title: true, entity: true, imageUrl: true } 
          } : undefined
        }
      });

      return res.status(201).json(message);
    }

    // PUT Request Handling
    if (req.method === 'PUT' && req.query.type === 'mark-read') {
      const { messageIds } = req.body;
      
      if (!Array.isArray(messageIds) || messageIds.length === 0) {
        return res.status(400).json({ error: 'Invalid message IDs' });
      }

      await prisma.chatMessage.updateMany({
        where: { id: { in: messageIds }, recipientId: userId },
        data: { isRead: true }
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}

export default allowCors(handler);