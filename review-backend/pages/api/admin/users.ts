// pages/api/admin/users.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Cors from 'cors';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const secretKey = process.env.JWT_SECRET || 'your_admin_jwt_secret';

// Initialize CORS middleware
const cors = Cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  origin: ['https://admin.riviewit.com', 'https://www.riviewit.com', 'https://riviewit.com', 'http://localhost:5173', 'http://localhost:5174']
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
  // Run CORS middleware first
  await runMiddleware(req, res, cors);

  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract and validate token
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    // Verify token and support both id and userId in token payload
    const decoded = jwt.verify(token, secretKey) as { id?: string | number; userId?: string | number; role?: string };
    
    // Get admin ID from either id or userId field
    const adminId = decoded.userId || decoded.id;

    // Check if user has admin role and valid ID
    if (!decoded.role || decoded.role !== 'admin' || !adminId) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // Token is valid and user is admin, proceed with request
    if (req.method === 'GET') {
      try {
        const users = await prisma.user.findMany();
        return res.status(200).json(users);
      } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ error: 'Failed to fetch users' });
      }
    } else if (req.method === 'DELETE') {
      const { id } = req.query;

      try {
        await prisma.user.delete({
          where: { id: Number(id) },
        });
        return res.status(200).json({ message: 'User deleted successfully' });
      } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ error: 'Failed to delete user' });
      }
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}
