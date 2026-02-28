import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Cors from 'cors';
import fs from 'fs';
import path from 'path';
import { IncomingForm } from 'formidable';

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

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing to handle FormData
  },
};

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

  try {
    const formData = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      const form = new IncomingForm({ multiples: true });
      form.parse(req, (err: any, fields: any, files: any) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });
    
    const { fields, files } = formData;

    if (!files.image) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    if (!fields.reviewId) {
      return res.status(400).json({ error: 'No reviewId provided' });
    }

    const reviewId = parseInt(fields.reviewId);
    if (isNaN(reviewId)) {
      return res.status(400).json({ error: 'Invalid reviewId' });
    }

    // Save the image file
    const imagePath = await saveFile(files.image);
    if (!imagePath) {
      return res.status(500).json({ error: 'Failed to save image file' });
    }

    // Update the review with the image URL
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { imageUrl: imagePath },
    });

    res.status(200).json({ success: true, imagePath });
  } catch (error) {
    console.error('Error uploading review image:', error);
    res.status(500).json({ 
      error: 'Failed to upload image', 
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
