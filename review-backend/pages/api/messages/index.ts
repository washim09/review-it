// pages/api/messages/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Cors from 'cors';
import jwt from 'jsonwebtoken';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { broadcastMessage } from '../events';

const prisma = new PrismaClient();
const cors = Cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  origin: '*', // Allow all origins for debugging
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

// Only disable body parser for POST requests (file uploads)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

// Helper to save uploaded media files
async function saveFile(file: formidable.File, mediaType: string): Promise<string> {
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', mediaType);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Generate a unique filename
  const timestamp = Date.now();
  const originalExt = path.extname(file.originalFilename || 'unknown');
  const newFilename = `${timestamp}${originalExt}`;
  const newPath = path.join(uploadsDir, newFilename);

  // Copy the file to the uploads directory
  const data = fs.readFileSync(file.filepath);
  fs.writeFileSync(newPath, data);
  fs.unlinkSync(file.filepath); // Remove the temp file

  // Return the URL path for storing in the database
  return `/uploads/${mediaType}/${newFilename}`;
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

  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;

  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required - valid Bearer token needed' });
  }

  // Get JWT secret with fallback for safety
  const JWT_SECRET = process.env.JWT_SECRET || '54b6b0d3a9a1d639b0797cac96e96623c832ca5952bcc12449604c98d59c08cf22edec3379e0203564346c68dc7e9dc16905e4328e3d65c7e6a53f743401dd44';
  
  try {
    // Log token info for debugging (don't log full token in production)

    // Verify the token and extract the user ID
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    if (!decoded || typeof decoded !== 'object') {
      console.error('Invalid token payload:', decoded);
      return res.status(401).json({ error: 'Invalid token format' });
    }
    
    const userId = decoded.userId;
    if (!userId) {
      console.error('Token missing userId property');
      return res.status(401).json({ error: 'Invalid token - missing user ID' });
    }

  if (req.method === 'GET') {
    try {
      // Fetch all messages for the logged-in user
      const messages = await prisma.chatMessage.findMany({
        where: {
          OR: [
            { senderId: userId },
            { recipientId: userId },
          ],
        },
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
          review: {
            select: {
              id: true,
              title: true,
              entity: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    // Use formidable to handle file uploads and form data
    const form = new formidable.IncomingForm({
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB limit (especially for voice messages)
    });

    try {
      const { fields, files } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve({ fields, files });
        });
      });

      // Extract fields
      let content = fields.content ? String(fields.content) : '';
      const recipientId = parseInt(String(fields.recipientId), 10);
      const reviewId = parseInt(String(fields.reviewId), 10);
      const replyToId = fields.replyToId ? parseInt(String(fields.replyToId), 10) : null;

      // Handle media files (if any)
      let mediaUrl = null;
      let mediaType = null;

      if (files.media) {
        // Cast to File type (Formidable types can be complex)
        const file = Array.isArray(files.media) ? files.media[0] : files.media as formidable.File;
        
        // Determine media type from mimetype
        const mimeType = file.mimetype || '';
        if (mimeType.startsWith('image/')) {
          mediaType = 'image';
        } else if (mimeType.startsWith('audio/')) {
          mediaType = 'audio';
        } else if (mimeType.startsWith('video/')) {
          mediaType = 'video';
        } else {
          mediaType = 'document';
        }

        // Save the file
        mediaUrl = await saveFile(file, mediaType);

        // If it's a voice message with empty content, add a placeholder
        if (mediaType === 'audio' && !content) {
          content = '🎤 Voice message';
        }
      }

      // Validate required data - only recipientId is actually required
      if (!recipientId) {
        return res.status(400).json({ error: 'Recipient ID is required' });
      }

      // Check if there's any content (text or media)
      if (!content && !mediaUrl) {
        return res.status(400).json({ error: 'Message cannot be empty' });
      }

      // Create the message
      // Create message with proper field typing
      const messageData: any = {
        content,
        senderId: userId,
        recipientId,
        isSent: true,      // Message is sent by default
        isDelivered: false, // Will be marked as delivered when recipient connects
      };
      
      // Only add reviewId if it was provided, otherwise try to find a fallback
      if (reviewId && !isNaN(reviewId)) {
        messageData.reviewId = reviewId;
      } else {
        // Find the first existing review between these users to use as fallback
        try {
          const fallbackReview = await prisma.review.findFirst({
            where: {
              OR: [
                { authorId: userId },
                { authorId: recipientId }
              ]
            },
            select: { id: true }
          });
          
          if (fallbackReview) {
            messageData.reviewId = fallbackReview.id;

          } else {
            // If no review exists, create a simple placeholder review
            const newReview = await prisma.review.create({
              data: {
                title: "Direct message",
                entity: "Chat",
                content: "System generated review for direct messaging",
                review: "System generated",
                rating: 5,
                authorId: userId
              }
            });
            messageData.reviewId = newReview.id;

          }
        } catch (error) {
          console.error('Error handling review fallback:', error);
          // In case of error, use ID 1 as absolute fallback (not ideal but prevents system from breaking)
          messageData.reviewId = 1;
        }
      }
      
      // Only add these fields if they have values
      if (mediaUrl) messageData.mediaUrl = mediaUrl;
      if (mediaType) messageData.mediaType = mediaType;
      if (replyToId) messageData.replyToId = replyToId;
      
      const message = await prisma.chatMessage.create({
        data: messageData,
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
          review: {
            select: {
              id: true,
              title: true,
              entity: true,
            },
          },
        },
      });

      // Broadcast the message to connected clients
      broadcastMessage(message);

      return res.status(201).json(message);
    } catch (error) {
      console.error('Error creating message:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    // Handle message updates including read status
    try {
      // For PUT requests, manually parse the body if needed
      let data;
      try {
        data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      } catch (e) {
        console.error('Error parsing request body:', e);
        data = {};
      }
      
      const { messageIds, status } = data || {};
      
      if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
        return res.status(400).json({ error: 'Message IDs array is required' });
      }
      
      // Update message status
      const updateData: any = {};
      if (status === 'read') updateData.isRead = true;
      if (status === 'delivered') updateData.isDelivered = true;
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No status update specified' });
      }
      
      // Update the messages
      await prisma.chatMessage.updateMany({
        where: {
          id: { in: messageIds },
          recipientId: userId, // Only update messages received by this user
        },
        data: updateData,
      });
      
      return res.status(200).json({ success: true, updated: messageIds });
    } catch (error) {
      console.error('Error updating messages:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

} catch (tokenError) {
  console.error('JWT Verification Error:', tokenError);
  return res.status(401).json({ error: 'Invalid authentication token' });
}
}
