import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs-extra';
import path from 'path';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../lib/prisma';
import Cors from 'cors';

// Disable Next.js body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

const JWT_SECRET = process.env.JWT_SECRET || '54b6b0d3a9a1d639b0797cac96e96623c832ca5952bcc12449604c98d59c08cf22edec3379e0203564346c68dc7e9dc16905e4328e3d65c7e6a53f743401dd44';

// Use backend/public/uploads as primary storage directory
const uploadDir = process.env.UPLOADS_PATH || path.join(process.cwd(), 'public', 'uploads');
fs.ensureDirSync(uploadDir);

// Initialize CORS middleware
const cors = Cors({
  methods: ['POST', 'OPTIONS'],
  origin: ['https://riviewit.com', 'https://www.riviewit.com', 'https://admin.riviewit.com', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Run CORS middleware first
  await runMiddleware(req, res, cors);
  
  // Handle OPTIONS requests for preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.substring(7);
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    const userId = parseInt(decoded.userId || decoded.id || decoded.sub, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID in token' });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB for profile images
      filter: (part) => {
        // Accept only images
        return part.mimetype?.includes('image/') || false;
      },
    });

    return new Promise<void>((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Upload error:', err);
          res.status(500).json({ message: 'Upload failed' });
          return resolve();
        }

        const file = files.file?.[0];
        
        if (!file) {
          res.status(400).json({ message: 'No file uploaded' });
          return resolve();
        }

        // Generate a unique filename
        const timestamp = Date.now();
        const originalFilename = file.originalFilename || 'profile-image';
        const fileExtension = path.extname(originalFilename);
        const baseFilename = path.basename(originalFilename, fileExtension);
        
        // Sanitize the base filename
        const sanitizedBase = baseFilename
          .replace(/\s+/g, '_')
          .replace(/[\(\)\[\]\{\}]/g, '')
          .replace(/[^a-zA-Z0-9._-]/g, '')
          .replace(/_{2,}/g, '_')
          .replace(/^_+|_+$/g, '');
        
        // Create the final filename
        const newFilename = `profile_${userId}_${timestamp}${fileExtension}`;
        const newFilePath = path.join(uploadDir, newFilename);
        
        try {
          // Rename the temp file to the new path
          fs.renameSync(file.filepath, newFilePath);
          
          // Generate the URL
          const fileUrl = `/uploads/${newFilename}`;
          
          // Update user's profileImage in the database
          await prisma.user.update({
            where: { id: userId },
            data: {
              profileImage: fileUrl,
              imageUrl: fileUrl,
            },
          });
          
          res.status(200).json({
            message: 'Profile image uploaded successfully',
            url: fileUrl,
          });
          
          return resolve();
        } catch (error) {
          console.error('File processing error:', error);
          res.status(500).json({ message: 'Error processing uploaded file' });
          return resolve();
        }
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
