import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import Cors from 'cors';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Initialize CORS middleware
const cors = Cors({
  origin: ['https://riviewit.com', 'https://www.riviewit.com', 'https://api.riviewit.com', 'https://admin.riviewit.com', 'http://localhost:5173', 'http://localhost:5174'],
  methods: ['POST', 'OPTIONS'],
  credentials: true,
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
  // Run CORS middleware
  await runMiddleware(req, res, cors);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Debug info
    const debugInfo = {
      tokenLength: token.length,
      tokenPreview: token.substring(0, 50) + '...',
      jwtSecretExists: !!process.env.JWT_SECRET,
      jwtSecretLength: JWT_SECRET.length,
      environment: process.env.NODE_ENV || 'development'
    };

    try {
      // Try to verify the token
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return res.status(200).json({
        success: true,
        decoded: {
          userId: decoded.userId,
          iat: decoded.iat,
          exp: decoded.exp,
          expired: Date.now() >= decoded.exp * 1000
        },
        debug: debugInfo
      });
    } catch (error) {
      // Try to decode without verification
      const decodedUnsafe = jwt.decode(token) as any;
      
      return res.status(200).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        decodedUnsafe: decodedUnsafe ? {
          userId: decodedUnsafe.userId,
          iat: decodedUnsafe.iat,
          exp: decodedUnsafe.exp,
          expired: decodedUnsafe.exp ? Date.now() >= decodedUnsafe.exp * 1000 : null
        } : null,
        debug: debugInfo
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
