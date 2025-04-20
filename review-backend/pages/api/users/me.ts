// review-backend/pages/api/users/me.ts

import { NextApiRequest, NextApiResponse } from 'next';
import allowCors from '../cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Handle preflight request (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Respond with 200 OK to preflight requests
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    // Validate Authorization Header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    // Verify JWT Token
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };

    // Get User
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      socialLinks: {
        twitter: user.twitter || '',
        facebook: user.facebook || '',
        instagram: user.instagram || ''
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default allowCors(handler);