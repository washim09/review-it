import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export const authenticate = (req: NextApiRequest, res: NextApiResponse, next: Function) => {
    const token = req.headers.authorization?.split(' ')[1]; // Token from `Bearer token`
  
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set');
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      (req as any).user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };