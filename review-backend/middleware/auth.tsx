// middleware/auth.tsx
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: number;
  email: string;
  [key: string]: any;
}

export const authenticate = (req: NextApiRequest, res: NextApiResponse, next: Function) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No Bearer token found');
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.error('Empty token');
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      // Verify token with your secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret') as JWTPayload;
      
      if (!decoded || typeof decoded !== 'object') {
        console.error('Invalid token payload:', decoded);
        return res.status(401).json({ error: 'Invalid token payload' });
      }

      // Validate required fields
      if (!decoded.userId || typeof decoded.userId !== 'number') {
        console.error('Invalid user ID in token:', decoded);
        return res.status(401).json({ error: 'Invalid user ID in token' });
      }

      if (!decoded.email || typeof decoded.email !== 'string') {
        console.error('Invalid email in token:', decoded);
        return res.status(401).json({ error: 'Invalid email in token' });
      }

      // Add user info to request
      (req as any).user = {
        userId: decoded.userId,
        email: decoded.email
      };

      console.log('Authentication successful:', { userId: decoded.userId });
      next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};