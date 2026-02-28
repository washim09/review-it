import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import Cors from 'cors';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Initialize CORS middleware
const cors = Cors({
  methods: ['POST', 'OPTIONS'],
  origin: ['https://riviewit.com', 'https://www.riviewit.com', 'https://api.riviewit.com', 'https://admin.riviewit.com', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Run CORS middleware
  await runMiddleware(req, res, cors);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // Verify the token (this will throw an error if the token is invalid or expired)
      // We use the { ignoreExpiration: true } option to allow expired tokens
      const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }) as { userId: number };
      
      // Check if the user exists and get complete user data
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { 
          id: true, 
          email: true, 
          name: true, 
          imageUrl: true,
          contact: true,
          dob: true,
          gender: true,
          address: true,
          city: true,
          state: true,
          instagram: true,
          facebook: true,
          twitter: true,
          createdAt: true
        }
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Create a new token
      const newToken = jwt.sign(
        { userId: user.id },
        JWT_SECRET,
        { expiresIn: '24h' } // Set a new expiration time
      );

      // Return the new token
      return res.status(200).json({
        message: 'Token refreshed successfully',
        token: newToken,
        user: user
      });
    } catch (error) {
      // If there's an error other than expiration, return 401
      if (error instanceof jwt.JsonWebTokenError && error.name !== 'TokenExpiredError') {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      // For expired tokens, we attempt to extract the user ID from the token payload
      const decodedToken = jwt.decode(token) as { userId?: number };
      
      if (!decodedToken || !decodedToken.userId) {
        return res.status(401).json({ error: 'Invalid token format' });
      }
      
      // Check if the user exists and get complete user data
      const user = await prisma.user.findUnique({
        where: { id: decodedToken.userId },
        select: { 
          id: true, 
          email: true, 
          name: true, 
          imageUrl: true,
          contact: true,
          dob: true,
          gender: true,
          address: true,
          city: true,
          state: true,
          instagram: true,
          facebook: true,
          twitter: true,
          createdAt: true
        }
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Create a new token
      const newToken = jwt.sign(
        { userId: user.id },
        JWT_SECRET,
        { expiresIn: '24h' } // Set a new expiration time
      );

      // Return the new token
      return res.status(200).json({
        message: 'Token refreshed successfully',
        token: newToken,
        user: user
      });
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
