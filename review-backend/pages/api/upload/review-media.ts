import { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import jwt from 'jsonwebtoken';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

// Initialize the CORS middleware
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD', 'OPTIONS'],
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

// Disable bodyParser to handle FormData
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

  // For all other requests, require authentication
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
      // No valid user ID found
      return res.status(401).json({ error: 'Invalid token: No user ID found' });
    }
    
    // Ensure we have a valid user ID
    if (isNaN(userId)) {
      return res.status(401).json({ error: 'Invalid user ID in token' });
    }

    const form = new IncomingForm({
      multiples: true,
    });

    form.parse(req, async (err, fields: any, files: any) => {
      if (err) {
        console.error('Form parsing error:', err);
        return res.status(500).json({ error: 'Error parsing form data' });
      }
      
      try {
        // Log received form data for debugging

        if (!fields.reviewId) {
          return res.status(400).json({ error: 'Missing reviewId field' });
        }
        
        const reviewId = parseInt(fields.reviewId);
        if (isNaN(reviewId)) {
          return res.status(400).json({ error: 'Invalid reviewId' });
        }
        
        // Handle image file if present
        let imagePath = null;
        if (files.image) {
          imagePath = await saveFile(files.image);
        }
        
        // Handle video file if present
        let videoPath = null;
        if (files.video) {
          videoPath = await saveFile(files.video);
        }
        
        if (!imagePath && !videoPath) {
          return res.status(400).json({ error: 'No media files provided' });
        }
        
        // Since this is just a test endpoint, we'll just return success
        return res.status(200).json({
          success: true,
          message: 'Media uploaded successfully (test endpoint)',
          mediaInfo: {
            reviewId,
            imageUrl: imagePath,
            videoUrl: videoPath
          }
        });
      } catch (error) {
        console.error('Error handling media upload:', error);
        return res.status(500).json({ error: 'Failed to process media upload' });
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
