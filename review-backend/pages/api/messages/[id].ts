// pages/api/messages/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Cors from 'cors';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Initialize CORS middleware
const cors = Cors({
  methods: ['GET', 'PUT', 'OPTIONS'],
  origin: ['https://riviewit.com', 'https://www.riviewit.com', 'https://admin.riviewit.com', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
});

// For debugging - log all requests
function logRequest(req: NextApiRequest) {

}

// Helper function to run the CORS middleware
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

// Helper to verify JWT token and get user ID
const getUserIdFromToken = (token: string): number | null => {
  if (!token) return null;
  
  try {
    // Use a fallback secret for development
    const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
    
    // The token contains userId, not id
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
      console.error('Invalid token format or missing userId:', decoded);
      return null;
    }
    
    return decoded.userId;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Log request details for debugging
  logRequest(req);
  
  try {
    // Run the CORS middleware
    await runMiddleware(req, res, cors);

    // Handle OPTIONS requests (preflight)
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Get the contact ID from the URL
    const contactIdParam = req.query.id;
    if (!contactIdParam || Array.isArray(contactIdParam)) {
      console.error('Invalid contact ID parameter:', contactIdParam);
      return res.status(400).json({ error: 'Invalid contact ID parameter' });
    }
    
    const contactId = Number(contactIdParam);
    if (isNaN(contactId)) {
      console.error('Contact ID is not a number:', contactIdParam);
      return res.status(400).json({ error: 'Contact ID must be a valid number' });
    }

    // Authentication check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header:', authHeader);
      return res.status(401).json({ error: 'Unauthorized - Valid Bearer token required' });
    }

    const token = authHeader.split(' ')[1];
    const userId = getUserIdFromToken(token);
    
    if (!userId) {
      console.error('Failed to get valid user ID from token');
      return res.status(401).json({ error: 'Unauthorized - Invalid token or user ID' });
    }

    // Handle GET request to fetch messages between two users
    if (req.method === 'GET') {
      try {

        // Use direct SQL query to avoid potential Prisma relation issues
        const result = await prisma.$queryRaw`
          SELECT 
            cm.id, 
            cm.content, 
            cm."senderId", 
            cm."recipientId", 
            cm."isRead", 
            cm."isDelivered", 
            cm."createdAt",
            s.id as "sender_id", 
            s.name as "sender_name", 
            s."imageUrl" as "sender_imageUrl",
            r.id as "recipient_id", 
            r.name as "recipient_name", 
            r."imageUrl" as "recipient_imageUrl"
          FROM "ChatMessage" cm
          JOIN "User" s ON cm."senderId" = s.id
          JOIN "User" r ON cm."recipientId" = r.id
          WHERE 
            (cm."senderId" = ${userId} AND cm."recipientId" = ${contactId})
            OR 
            (cm."senderId" = ${contactId} AND cm."recipientId" = ${userId})
          ORDER BY cm."createdAt" ASC
        `;
        
        // Format the results to match the expected Message interface
        const messages = (result as any[]).map(row => ({
          id: row.id,
          content: row.content,
          senderId: row.senderId,
          recipientId: row.recipientId,
          isRead: row.isRead,
          isDelivered: row.isDelivered,
          createdAt: row.createdAt.toISOString(),
          sender: {
            id: row.sender_id,
            name: row.sender_name,
            imageUrl: row.sender_imageUrl
          },
          recipient: {
            id: row.recipient_id,
            name: row.recipient_name,
            imageUrl: row.recipient_imageUrl
          }
        }));

        return res.status(200).json(messages);
      } catch (error) {
        // If there's an error fetching messages, log it and return empty array
        console.error('Error fetching real messages:', error);
        return res.status(500).json({ error: 'Failed to fetch messages from database' });
      }
    }
  
  // Handle PUT request to mark messages as read
  if (req.method === 'PUT') {
    try {

      // In a real implementation, we would update the database here
      // await prisma.chatMessage.updateMany({...});
      
      // For now, just return success
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return res.status(500).json({ error: 'Failed to mark messages as read' });
    }
  }
  
  // Only GET and PUT are allowed for this endpoint
  return res.status(405).json({ error: 'Method not allowed' });
  
} catch (error) {
  // Global error handler
  console.error('Unhandled error in message API:', error);
  return res.status(500).json({ 
    error: 'An unexpected error occurred',
    message: error instanceof Error ? error.message : 'Unknown error'
  });
}

}
