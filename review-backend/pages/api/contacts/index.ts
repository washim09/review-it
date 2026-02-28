// pages/api/contacts/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Cors from 'cors';
import { verifyToken, extractTokenFromHeader } from '../../../utils/authUtils';

const prisma = new PrismaClient();

// Initialize CORS middleware
const cors = Cors({
  methods: ['GET', 'OPTIONS'],
  origin: ['https://riviewit.com', 'https://www.riviewit.com', 'https://admin.riviewit.com', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
});

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

// We're now using the centralized auth utilities instead of local implementation

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Run the CORS middleware
  await runMiddleware(req, res, cors);

  // Handle OPTIONS requests (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Authentication check
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  const token = extractTokenFromHeader(authHeader);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - Invalid token format' });
  }
  
  const tokenResult = verifyToken(token);
  
  // Handle expired tokens specially - allow them to continue but signal refresh needed
  if (tokenResult.isExpired) {
    if (tokenResult.userId) {
      // Continue with the request, but add a header to signal token refresh is needed
      res.setHeader('X-Token-Expired', 'true');
      console.log(`Allowing expired token for user ${tokenResult.userId}`);
    } else {
      // Couldn't get user ID from expired token
      return res.status(401).json({ error: 'Unauthorized - Expired token, please login again' });
    }
  } else if (!tokenResult.userId) {
    // Token is invalid (not just expired)
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
  
  const userId = tokenResult.userId;

  // Handle GET request to fetch contacts
  if (req.method === 'GET') {
    try {
      // Use tokenResult.userId which we know is valid by this point
      const userId = tokenResult.userId!;

      // Get all users who have had conversations with this user
      // First, find all chat messages where this user is either sender or recipient
      const chatPartners = await prisma.chatMessage.findMany({
        where: {
          OR: [
            { senderId: userId },
            { recipientId: userId }
          ]
        },
        select: {
          senderId: true,
          recipientId: true,
          sender: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            }
          },
          recipient: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            }
          },
          review: {
            select: {
              id: true,
              title: true,
              entity: true,
            }
          },
          content: true,
          createdAt: true,
          isRead: true,
        },
        orderBy: {
          createdAt: 'desc' // Get newest messages first
        }
      });
      
      // Extract unique contacts from chat messages
      const contactMap = new Map();
      
      chatPartners.forEach(msg => {
        // Determine if the other party is sender or recipient
        const otherPartyId = msg.senderId === userId ? msg.recipientId : msg.senderId;
        const otherParty = msg.senderId === userId ? msg.recipient : msg.sender;
        
        if (!contactMap.has(otherPartyId)) {
          // First message with this contact, create entry
          contactMap.set(otherPartyId, {
            id: otherPartyId,
            name: otherParty.name,
            imageUrl: otherParty.imageUrl,
            lastMessage: {
              content: msg.content,
              createdAt: msg.createdAt,
              isRead: msg.isRead,
              senderId: msg.senderId,
            },
            unreadCount: (msg.recipientId === userId && !msg.isRead) ? 1 : 0,
            review: msg.review,
          });
        } else if (msg.recipientId === userId && !msg.isRead) {
          // Increment unread count if this is an unread message sent to the user
          const contact = contactMap.get(otherPartyId);
          contact.unreadCount = (contact.unreadCount || 0) + 1;
        }
      });
      
      // Convert map to array
      const contacts = Array.from(contactMap.values());

      // Return the contacts
      return res.status(200).json(contacts);

    } catch (error) {
      console.error('Error fetching contacts:', error);
      return res.status(500).json({ error: 'Failed to fetch contacts' });
    }
  }

  // Only GET is allowed for this endpoint
  return res.status(405).json({ error: 'Method not allowed' });
}
