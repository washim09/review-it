import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs-extra';
import path from 'path';
import Cors from 'cors';

// Disable Next.js body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Use backend/public/uploads as primary storage directory
const uploadDir = process.env.UPLOADS_PATH || path.join(process.cwd(), 'public', 'uploads');
fs.ensureDirSync(uploadDir);

// Initialize CORS middleware
const cors = Cors({
  methods: ['POST', 'OPTIONS'],
  origin: ['https://riviewit.com', 'https://www.riviewit.com', 'https://admin.riviewit.com', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'], // Allow requests from both frontend and admin
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
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 25 * 1024 * 1024, // Increased to 25MB to accommodate videos
      filter: (part) => {
        // Accept both images and videos
        return part.mimetype?.includes('image/') || 
               part.mimetype?.includes('video/') || 
               false;
      },
    });

    return new Promise<void>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Upload error:', err);
          res.status(500).json({ message: 'Upload failed' });
          return resolve();
        }

        const file = files.file?.[0]; // Get the first file from the 'file' field
        
        if (!file) {
          res.status(400).json({ message: 'No file uploaded' });
          return resolve();
        }

        // Generate a unique filename to prevent overwriting
        const timestamp = Date.now();
        const originalFilename = file.originalFilename || 'uploaded-file';
        
        // Extract extension from the original filename, not from temp filepath
        const fileExtension = path.extname(originalFilename);
        const baseFilename = path.basename(originalFilename, fileExtension);
        
        // Sanitize the base filename more aggressively:
        // 1. Replace spaces with underscores
        // 2. Remove parentheses and brackets
        // 3. Remove all other special characters except dots, underscores, and hyphens
        const sanitizedBase = baseFilename
          .replace(/\s+/g, '_')                    // spaces to underscores
          .replace(/[\(\)\[\]\{\}]/g, '')          // remove all brackets/parentheses
          .replace(/[^a-zA-Z0-9._-]/g, '')         // remove other special chars
          .replace(/_{2,}/g, '_')                  // collapse multiple underscores
          .replace(/^_+|_+$/g, '');               // trim underscores from start/end
        
        // Create the final filename with timestamp prefix and original extension
        const newFilename = `${sanitizedBase}_${timestamp}${fileExtension}`;
        
        // Create the full new path
        const newFilePath = path.join(uploadDir, newFilename);
        
        try {
          // Rename the temp file to the new path
          fs.renameSync(file.filepath, newFilePath);
          
          // Generate the URL (relative to the public directory)
          const fileUrl = `/uploads/${newFilename}`;
          
          res.status(200).json({
            message: 'File uploaded successfully',
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
