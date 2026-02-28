// services/authService.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check if user has a password (OAuth users might not have passwords)
  if (!user.password) {
    throw new Error('Invalid credentials. Please use social login.');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // Use fallback JWT secret if environment variable is not set
  const JWT_SECRET = process.env.JWT_SECRET || '54b6b0d3a9a1d639b0797cac96e96623c832ca5952bcc12449604c98d59c08cf22edec3379e0203564346c68dc7e9dc16905e4328e3d65c7e6a53f743401dd44';
  
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: '7d', // Extended token validity for testing
  });

  return { token, user: { id: user.id, email: user.email } };
};

export const authenticateToken = (token: string) => {
  // Use fallback JWT secret if environment variable is not set
  const JWT_SECRET = process.env.JWT_SECRET || '54b6b0d3a9a1d639b0797cac96e96623c832ca5952bcc12449604c98d59c08cf22edec3379e0203564346c68dc7e9dc16905e4328e3d65c7e6a53f743401dd44';
  
  try {
    // Make sure token is a string and not null/undefined
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token format');
    }
    
    // Verify and return the decoded token
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error);
    throw error;
  }
};