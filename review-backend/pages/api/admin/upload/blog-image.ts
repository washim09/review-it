import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs-extra';
import path from 'path';
import jwt from 'jsonwebtoken';
import Cors from 'cors';

// Disable Next.js body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

const JWT_SECRET = process.env.JWT_SECRET || 'a8f5f167f44f4964e6c998dee827110c8bd1a9c8b4e5f2a3b7d8c9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || JWT_SECRET;

// Create blog-specific upload directory
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'blog');
fs.ensureDirSync(uploadDir);

// Initialize CORS middleware
const cors = Cors({
  methods: ['POST', 'OPTIONS'],
  origin: [
    'https://riviewit.com',
    'https://www.riviewit.com',
    'https://admin.riviewit.com',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
  ],
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

  // Handle OPTIONS requests for preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify admin authentication token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.substring(7);
    let decoded: any;

    try {
      // Try admin token first, then fallback to regular JWT
      try {
        decoded = jwt.verify(token, ADMIN_JWT_SECRET);
      } catch {
        decoded = jwt.verify(token, JWT_SECRET);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    // Verify it's an admin token
    if (!decoded.isAdmin && !decoded.role?.includes('admin')) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB for blog images
      filter: (part) => {
        // Accept only images
        return part.mimetype?.includes('image/') || false;
      },
    });

    return new Promise<void>((resolve) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Upload error:', err);
          res.status(500).json({ message: 'Upload failed', error: err.message });
          return resolve();
        }

        const file = files.file?.[0];

        if (!file) {
          res.status(400).json({ message: 'No file uploaded' });
          return resolve();
        }

        // Generate a unique filename
        const timestamp = Date.now();
        const originalFilename = file.originalFilename || 'blog-image';
        const fileExtension = path.extname(originalFilename);
        const baseFilename = path.basename(originalFilename, fileExtension);

        // Sanitize the base filename
        const sanitizedBase = baseFilename
          .replace(/\s+/g, '_')
          .replace(/[\(\)\[\]\{\}]/g, '')
          .replace(/[^a-zA-Z0-9._-]/g, '')
          .replace(/_{2,}/g, '_')
          .replace(/^_+|_+$/g, '');

        // Determine image type from field (coverImage or authorImage)
        const imageType = fields.type?.[0] || 'blog';

        // Create the final filename
        const newFilename = `${imageType}_${sanitizedBase}_${timestamp}${fileExtension}`;
        const newFilePath = path.join(uploadDir, newFilename);

        try {
          // Move the temp file to the final path
          await fs.move(file.filepath, newFilePath, { overwrite: true });

          // Generate the FULL URL with API domain (not relative path)
          const apiDomain = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'https://api.riviewit.com';
          const fileUrl = `${apiDomain}/uploads/blog/${newFilename}`;

          res.status(200).json({
            message: 'Blog image uploaded successfully',
            url: fileUrl,
            filename: newFilename,
          });

          return resolve();
        } catch (error) {
          console.error('File processing error:', error);
          res.status(500).json({
            message: 'Error processing uploaded file',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          return resolve();
        }
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
