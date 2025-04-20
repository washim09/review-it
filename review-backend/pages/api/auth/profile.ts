// File: pages/api/profile.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import Cors from 'cors';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

// Initialize CORS middleware
const cors = Cors({
  origin: 'http://localhost:5173', // Your frontend URL
  methods: ['GET', 'OPTIONS'], // Allow GET and OPTIONS
  allowedHeaders: ['Authorization'], // Allow Authorization header
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
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          contact: true,
          address: true,
          city: true,
          state: true,
          instagram: true,
          facebook: true,
          twitter: true,
        },
      });
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json(user);
    } catch (error) {
      console.error('Error:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}