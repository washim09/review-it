import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Cors from 'cors';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Initialize the CORS middleware with broader permissions
const cors = Cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  origin: '*', // Allow all origins for development
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
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

  // All endpoints here require admin authentication
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    
    // Ensure the user is an admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const userId = parseInt(decoded.userId);

    // Handle GET request - list all reviews (admin only)
    if (req.method === 'GET') {
      try {
        const reviews = await prisma.review.findMany({
          select: {
            id: true,
            title: true,
            content: true,
            review: true, // Added the detailed review field
            rating: true,
            createdAt: true,
            entity: true, // This is the product/entity name field
            category: true,
            imageUrl: true,
            videoUrl: true, 
            tags: true,
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                imageUrl: true
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
        
        return res.status(200).json(reviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        return res.status(500).json({ error: 'Failed to fetch reviews' });
      }
    } 
    // Handle POST request - create a review as admin
    else if (req.method === 'POST') {
      try {
        const review = await prisma.review.create({
          data: {
            ...req.body,
            authorId: req.body.authorId || userId,  // Allow admin to specify author
          },
        });
        
        return res.status(201).json({ success: true, review });
      } catch (error) {
        console.error('Error creating review:', error);
        return res.status(500).json({ success: false, error: 'Failed to create review' });
      }
    } 
    // Method not allowed
    else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Invalid token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}
