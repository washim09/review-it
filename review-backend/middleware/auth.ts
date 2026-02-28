import { NextApiRequest, NextApiResponse } from 'next';
import { authenticateToken } from '../services/authService';

// Next.js API middleware to authenticate requests
export const authenticate = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return { success: false, error: 'Unauthorized: No token provided' };
    }
    
    const decoded = authenticateToken(token);
    return { success: true, user: decoded };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Invalid authentication token' };
  }
};