import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Cors from 'cors';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { IncomingForm } from 'formidable';

const prisma = new PrismaClient();

// Initialize the CORS middleware with wider permissions
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE'], 
  origin: ['https://riviewit.com', 'https://www.riviewit.com', 'http://localhost:5173', 'http://localhost:5174'],
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

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Adjust the size limit as needed
    },
  },
};

const JWT_SECRET = process.env.JWT_SECRET || '54b6b0d3a9a1d639b0797cac96e96623c832ca5952bcc12449604c98d59c08cf22edec3379e0203564346c68dc7e9dc16905e4328e3d65c7e6a53f743401dd44';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Run the CORS middleware
  await runMiddleware(req, res, cors);

  // Handle OPTIONS requests (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check if the request is for the latest reviews (public endpoint)
  if (req.method === 'GET' && req.query.latest === 'true') {
    // Fetch the latest reviews without requiring authentication
    try {
      const latestReviews = await prisma.review.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              name: true,
            },
          },
        },
      });
      return res.status(200).json(latestReviews);
    } catch (error) {
      console.error('Failed to fetch latest reviews:', error);
      return res.status(500).json({ error: 'Failed to fetch latest reviews' });
    }
  }

  // For all other requests, require authentication
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    // Get raw token for debugging

    // Split the token to manually check it's structure
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return res.status(401).json({ error: 'Invalid token format' });
    }
    
    try {
      // Try to decode the token without verification first to see its structure
      const rawPayload = tokenParts[1];
      const decodedRaw = Buffer.from(rawPayload, 'base64').toString();

    } catch (e) {

    }
    
    // Now verify the token properly
    let decoded: any = jwt.verify(token, JWT_SECRET);

    // Find user ID in the decoded token - our system uses different formats
    let userId: number;
    
    if (typeof decoded.id === 'number') {
      // If token contains id as a number
      userId = decoded.id;
    } else if (typeof decoded.id === 'string') {
      // If token contains id as a string
      userId = parseInt(decoded.id);
    } else if (typeof decoded.userId === 'number') {
      // If token contains userId as a number
      userId = decoded.userId;
    } else if (typeof decoded.userId === 'string') {
      // If token contains userId as a string
      userId = parseInt(decoded.userId);
    } else {
      // No valid user ID found
      console.error('No valid user ID found in token:', decoded);
      return res.status(401).json({ error: 'Invalid token: No user ID found' });
    }
    
    // Ensure we have a valid user ID
    if (isNaN(userId)) {
      return res.status(401).json({ error: 'Invalid user ID in token' });
    }

    if (req.method === 'GET') {
      try {
        // Fetch reviews for the authenticated user
        const reviews = await prisma.review.findMany({
          where: {
            authorId: userId,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return res.status(200).json(reviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        return res.status(500).json({ error: 'Failed to fetch reviews' });
      }
    } else if (req.method === 'POST') {
      try {
        // Now we're using the Next.js built-in JSON parser
        const reqData = req.body;

        // Check for required fields
        const missingFields = [];
        if (!reqData.title) missingFields.push('title');
        if (!reqData.content) missingFields.push('content');
        if (reqData.rating === undefined) missingFields.push('rating');
        
        if (missingFields.length > 0) {
          console.error('Missing required fields:', missingFields);
          return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
        }
        
        // Get tags array
        const tags = Array.isArray(reqData.tags) ? reqData.tags : [];
        
        // Get author ID from token (we already verified it)

        // Create review in the database
        const review = await prisma.review.create({
          data: {
            entity: reqData.entity || reqData.title || 'general', // Default to title if entity not provided
            rating: Number(reqData.rating),
            title: reqData.title,
            content: reqData.content,
            review: reqData.content, // Use content as review field as well 
            category: reqData.category || null,
            tags: tags,
            authorId: userId,
            mediaUrls: [],
            // Media URLs will be updated separately in a media upload endpoint
            imageUrl: null,
            videoUrl: null,
          },
        });

        return res.status(201).json({ success: true, review });
      } catch (error) {
        console.error('Error creating review:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to create review',
          details: error instanceof Error ? error.message : String(error),
        });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    
    // If token verification fails, send a detailed error message
    return res.status(401).json({ 
      error: 'Unauthorized: Invalid token', 
      details: error instanceof Error ? error.message : 'Unknown error',
      tokenReceived: token ? `${token.substring(0, 10)}...` : 'none' // Only show part of token for security
    });
  }
}

// Helper function to save uploaded files
const saveFile = async (file: any) => {
  if (!file) return null;

  try {
    // Handle array or single file
    const targetFile = Array.isArray(file) ? file[0] : file;
    
    // Get filename from formidable object
    let originalFilename = '';
    if (targetFile.originalFilename) {
      originalFilename = targetFile.originalFilename;
    } else if (targetFile.name) {
      originalFilename = targetFile.name;
    } else if (targetFile.filename) {
      originalFilename = targetFile.filename;
    } else {
      originalFilename = `file_${Date.now()}`;
    }
    
    const fileExtension = path.extname(originalFilename) || '.unknown';
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Create a unique filename
    const newFilename = `${path.basename(originalFilename, fileExtension)}_${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadDir, newFilename);

    // Get the filepath from formidable object
    const sourceFilePath = targetFile.filepath || targetFile.path;
    
    if (!sourceFilePath) {
      console.error('No source file path found:', targetFile);
      return null;
    }

    // Copy the file to uploads directory
    await fs.promises.copyFile(sourceFilePath, filePath);
    
    // Clean up the temp file
    try {
      await fs.promises.unlink(sourceFilePath);
    } catch (err) {
      console.error('Error cleaning up temp file:', err);
      // Continue even if cleanup fails
    }

    // Return the relative URL path
    return `/uploads/${newFilename}`;
  } catch (error) {
    console.error('Error saving file:', error);
    return null;
  }
};
