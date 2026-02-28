// File: pages/api/profile.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import Cors from 'cors';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

// Initialize CORS middleware
const cors = Cors({
  origin: ['https://riviewit.com', 'https://www.riviewit.com', 'https://admin.riviewit.com', 'http://localhost:5173', 'http://localhost:3000'], // Your frontend URL
  methods: ['GET', 'PUT', 'OPTIONS'], // Allow GET, PUT and OPTIONS
  allowedHeaders: ['Authorization', 'Content-Type'], // Allow Authorization and Content-Type headers
  credentials: true, // Allow credentials (cookies, headers)
});

// Helper to run middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Run CORS middleware
  await runMiddleware(req, res, cors);

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle GET request
  if (req.method === 'GET') {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing token' });
    }

    const token = authHeader.split(' ')[1];
    let userId: number;
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      userId = decoded.userId;
    } catch (error) {
      // Handle expired tokens by extracting userId without verification
      if (error instanceof jwt.TokenExpiredError) {
        try {
          const decodedExpired = jwt.decode(token) as { userId: number };
          if (decodedExpired && decodedExpired.userId) {
            userId = decodedExpired.userId;
            res.setHeader('X-Token-Expired', 'true');
            console.log(`Allowing expired token for user ${userId}`);
          } else {
            return res.status(401).json({ error: 'Invalid expired token' });
          }
        } catch (decodeError) {
          return res.status(401).json({ error: 'Invalid token format' });
        }
      } else {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
          profileImage: true,
          contact: true,
          dob: true,
          gender: true,
          address: true,
          city: true,
          state: true,
          instagram: true,
          facebook: true,
          twitter: true,
          createdAt: true,
        },
      });
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json(user);
    } catch (error) {
      console.error('Error:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  // Handle PUT request for profile updates
  if (req.method === 'PUT') {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing token' });
    }

    const token = authHeader.split(' ')[1];
    let userId: number;
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      userId = decoded.userId;
    } catch (error) {
      // Handle expired tokens by extracting userId without verification
      if (error instanceof jwt.TokenExpiredError) {
        try {
          const decodedExpired = jwt.decode(token) as { userId: number };
          if (decodedExpired && decodedExpired.userId) {
            userId = decodedExpired.userId;
            res.setHeader('X-Token-Expired', 'true');
            console.log(`Allowing expired token for user ${userId}`);
          } else {
            return res.status(401).json({ error: 'Invalid expired token' });
          }
        } catch (decodeError) {
          return res.status(401).json({ error: 'Invalid token format' });
        }
      } else {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }
    
    try {
      const { name, contact, dob, gender, address, city, state, instagram, facebook, twitter, profileImage } = req.body;

      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: name || undefined,
          contact: contact || undefined,
          dob: dob ? new Date(dob) : undefined,
          gender: gender || undefined,
          address: address || undefined,
          city: city || undefined,
          state: state || undefined,
          instagram: instagram || undefined,
          facebook: facebook || undefined,
          twitter: twitter || undefined,
          profileImage: profileImage || undefined,
          imageUrl: profileImage || undefined,
        },
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
          profileImage: true,
          contact: true,
          dob: true,
          gender: true,
          address: true,
          city: true,
          state: true,
          instagram: true,
          facebook: true,
          twitter: true,
          createdAt: true,
        },
      });

      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Profile update error:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}