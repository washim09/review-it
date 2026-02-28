import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Cors from 'cors';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Initialize the CORS middleware
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE'], 
  origin: ['https://riviewit.com', 'https://www.riviewit.com', 'https://admin.riviewit.com', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
});

// Helper function to run the CORS middleware
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

const JWT_SECRET = process.env.JWT_SECRET || '54b6b0d3a9a1d639b0797cac96e96623c832ca5952bcc12449604c98d59c08cf22edec3379e0203564346c68dc7e9dc16905e4328e3d65c7e6a53f743401dd44';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Run the CORS middleware
  await runMiddleware(req, res, cors);

  // Handle OPTIONS requests (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // For all other requests, require authentication
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    // Verify the token
    let decoded: any = jwt.verify(token, JWT_SECRET);
    
    // Find user ID in the decoded token
    let userId: number;
    
    if (typeof decoded.id === 'number') {
      userId = decoded.id;
    } else if (typeof decoded.id === 'string') {
      userId = parseInt(decoded.id);
    } else if (typeof decoded.userId === 'number') {
      userId = decoded.userId;
    } else if (typeof decoded.userId === 'string') {
      userId = parseInt(decoded.userId);
    } else {
      return res.status(401).json({ error: 'Invalid token: No user ID found' });
    }
    
    // Ensure we have a valid user ID
    if (isNaN(userId)) {
      return res.status(401).json({ error: 'Invalid user ID in token' });
    }

    if (req.method === 'POST') {
      // This is a simplified version that just echoes back the data
      try {

        // Just return success without actually creating anything
        const mockReview = {
          id: Math.floor(Math.random() * 10000),
          title: req.body.title || 'Default Title',
          content: req.body.content || 'Default Content',
          rating: req.body.rating || 5,
          createdAt: new Date().toISOString(),
          authorId: userId
        };
        
        return res.status(201).json({ 
          success: true, 
          message: 'Review submitted successfully (test endpoint)',
          review: mockReview
        });
      } catch (error) {
        console.error('Error in simple review endpoint:', error);
        return res.status(500).json({ success: false, error: 'Server error' });
      }
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ 
      error: 'Unauthorized: Invalid token', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
