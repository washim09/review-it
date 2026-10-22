import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Cors from 'cors';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || '54b6b0d3a9a1d639b0797cac96e96623c832ca5952bcc12449604c98d59c08cf22edec3379e0203564346c68dc7e9dc16905e4328e3d65c7e6a53f743401dd44';

// Initialize the CORS middleware
const cors = Cors({
  methods: ['POST', 'OPTIONS'],
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Run the CORS middleware
  await runMiddleware(req, res, cors);

  // Handle OPTIONS requests (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Admin access required' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role?: string };
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
  } catch {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  try {
    const { title, content, rating, authorId, entity, tags } = req.body;

    // Input validation
    if (!title || !content || !rating || !authorId) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        received: { title, content, rating, authorId } 
      });
    }

    // Parse tags if they're a JSON string
    let parsedTags = tags || [];
    if (typeof parsedTags === 'string') {
      try {
        parsedTags = JSON.parse(parsedTags);
      } catch (e) {
        parsedTags = [parsedTags];
      }
    }

    // Create review in the database
    const review = await prisma.review.create({
      data: {
        title,
        content,
        review: content, // Use content as review if review field not provided
        entity: entity || title, // Use title as entity if not provided
        rating: parseInt(rating.toString()),
        authorId: parseInt(authorId.toString()),
        tags: Array.isArray(parsedTags) ? parsedTags : [],
        rewardStatus: 'INELIGIBLE',
      },
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ 
      error: 'Failed to create review', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
