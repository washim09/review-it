// services/authService.ts
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticateToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid token');
  }
};

export const generateToken = async (userId: string, email: unknown): Promise<string> => {
  const payload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
  };

  return jwt.sign(payload, JWT_SECRET);
};