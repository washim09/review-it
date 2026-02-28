// pages/api/messages/send.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Cors from 'cors';
import { broadcastMessage } from '../events';

const prisma = new PrismaClient();
const cors = Cors({
  methods: ['POST', 'OPTIONS'],
  origin: ['https://riviewit.com', 'https://www.riviewit.com', 'https://admin.riviewit.com', 'http://localhost:5173', 'http://localhost:5174'],
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

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Extract data from request
    const { content, senderId, recipientId, reviewId } = req.body;

    // Validate required fields
    if (!content || !senderId || !recipientId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { content, senderId, recipientId }
      });
    }

    try {
      // Parse the IDs to integers
      const senderIdInt = parseInt(senderId);
      const recipientIdInt = parseInt(recipientId);
      
      // Prepare the create data
      let createData: any = {
        content,
        sender: { connect: { id: senderIdInt } },
        recipient: { connect: { id: recipientIdInt } },
        isRead: false,
        isDelivered: false
        // Removed isSent as it doesn't exist in the database
      };
      
      // Only add review connection if reviewId is provided
      if (reviewId) {
        createData.review = { connect: { id: parseInt(reviewId) } };
      }
      
      // Create the message
      const message = await prisma.chatMessage.create({
        data: createData,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
          recipient: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
          review: reviewId ? {
            select: {
              id: true,
              title: true,
              entity: true,
            },
          } : undefined,
        },
      });

      // Broadcast the message to connected clients if available
      if (typeof broadcastMessage === 'function') {
        broadcastMessage(message);
      }

      return res.status(201).json(message);
    } catch (error: any) {
      console.error('Error in Prisma create:', error);
      throw error; // Re-throw to be caught by the outer catch block
    }
  } catch (error: any) {
    console.error('Error creating message:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error?.message || 'Unknown error'
    });
  }
}
