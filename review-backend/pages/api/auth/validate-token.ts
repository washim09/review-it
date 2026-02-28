// pages/api/auth/validate-token.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Cors from 'cors';
import { verifyToken, extractTokenFromHeader } from '../../../utils/authUtils';

const prisma = new PrismaClient();

// Initialize the CORS middleware with wider access for testing
const cors = Cors({
  methods: ['GET', 'POST', 'OPTIONS'],
  origin: '*', // Allow any origin for testing purposes
  credentials: true,
});

// Helper function to run the CORS middleware
async function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Run CORS middleware
  await runMiddleware(req, res, cors);

  // Handle OPTIONS requests for preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header found' });
  }

  const token = extractTokenFromHeader(authHeader);
  if (!token) {
    return res.status(401).json({ error: 'Invalid token format' });
  }

  // Use our improved token verification function
  const tokenResult = verifyToken(token);

  if (!tokenResult.userId) {
    // Token is invalid and we couldn't extract a user ID
    return res.status(401).json({
      valid: false,
      error: tokenResult.error || 'Invalid token',
      isExpired: tokenResult.isExpired || false
    });
  }

  // For expired tokens, still return valid=true but indicate expiration
  // This allows the frontend to know it needs to refresh the token
  if (tokenResult.isExpired) {
    return res.status(200).json({
      valid: true, // Consider it still valid for auth purposes
      userId: tokenResult.userId,
      isExpired: true, // But mark it as expired
      needsRefresh: true
    });
  }

  // Token is valid and not expired
  return res.status(200).json({
    valid: true,
    userId: tokenResult.userId,
    isExpired: false
  });
}
