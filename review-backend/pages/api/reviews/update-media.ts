import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Cors from 'cors';
import jwt from 'jsonwebtoken';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

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

// Disable bodyParser for form data
export const config = {
  api: {
    bodyParser: false,
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

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for auth token
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    // Verify the token
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
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
    
    // Parse form data
    const form = new IncomingForm({
      multiples: true,
    });

    form.parse(req, async (err, fields: any, files: any) => {
      if (err) {
        console.error('Form parsing error:', err);
        return res.status(500).json({ error: 'Error parsing form data' });
      }
      
      try {

        // Check for required reviewId
        if (!fields.reviewId) {
          return res.status(400).json({ error: 'Missing reviewId' });
        }
        
        const reviewId = parseInt(fields.reviewId);
        if (isNaN(reviewId)) {
          return res.status(400).json({ error: 'Invalid reviewId format' });
        }
        
        // Verify the review exists and belongs to this user
        const review = await prisma.review.findUnique({
          where: { id: reviewId },
        });
        
        if (!review) {
          return res.status(404).json({ error: 'Review not found' });
        }
        
        // Optional: Check if the review belongs to the user
        if (review.authorId !== userId) {
          return res.status(403).json({ error: 'Not authorized to update this review' });
        }
        
        // Process the files
        let imageUrl = null;
        let videoUrl = null;
        
        // Handle image file
        if (files.image) {

          imageUrl = await saveFile(files.image);
        }
        
        // Handle video file
        if (files.video) {

          videoUrl = await saveFile(files.video);
        }
        
        if (!imageUrl && !videoUrl) {
          return res.status(400).json({ error: 'No media files provided' });
        }
        
        // Only update the fields that have new media
        const updateData: any = {};
        if (imageUrl) updateData.imageUrl = imageUrl;
        if (videoUrl) updateData.videoUrl = videoUrl;

        // Update the review with media URLs
        const updatedReview = await prisma.review.update({
          where: { id: reviewId },
          data: updateData,
        });

        return res.status(200).json({
          success: true,
          message: 'Media updated successfully',
          review: updatedReview,
        });
      } catch (error) {
        console.error('Error handling media update:', error);
        return res.status(500).json({ error: 'Failed to process media update' });
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ 
      error: 'Unauthorized: Invalid token', 
      details: error instanceof Error ? error.message : 'Unknown error'
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
