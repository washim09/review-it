import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import Cors from 'cors';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Initialize the CORS middleware
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD', 'DELETE', 'OPTIONS'],
  origin: ['http://localhost:5173', 'http://localhost:5174'],
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
    bodyParser: false,
  },
};

const secretKey = '54b6b0d3a9a1d639b0797cac96e96623c832ca5952bcc12449604c98d59c08cf22edec3379e0203564346c68dc7e9dc16905e4328e3d65c7e6a53f743401dd44';

// Debug utility function
function debugFileObject(file: any): string {
  if (!file) return 'NULL';
  if (Array.isArray(file)) return `ARRAY[${file.length}]`;
  
  return JSON.stringify({
    filepath: file.filepath,
    originalFilename: file.originalFilename,
    newFilename: file.newFilename,
    size: file.size,
    mimetype: file.mimetype
  }, null, 2);
}

// Improved file saving function
const saveFile = async (file: any): Promise<string | null> => {
  console.log('[DEBUG] Input file object:', debugFileObject(file));

  try {
    if (!file) {
      console.log('[DEBUG] No file provided to saveFile');
      return null;
    }

    const targetFile = Array.isArray(file) ? file[0] : file;
    if (!targetFile) {
      console.log('[DEBUG] Empty file array provided');
      return null;
    }

    if (!targetFile.filepath || typeof targetFile.filepath !== 'string') {
      console.error('[ERROR] Invalid file object - missing filepath:', targetFile);
      return null;
    }

    // Verify source file exists
    try {
      await fs.promises.access(targetFile.filepath, fs.constants.R_OK);
    } catch (err) {
      console.error('[ERROR] Source file does not exist or is not readable:', targetFile.filepath);
      return null;
    }

    // Prepare destination paths
    let originalFilename: string;
    try {
      originalFilename = targetFile.originalFilename || 
                        targetFile.newFilename || 
                        path.basename(targetFile.filepath);
      
      if (!originalFilename) {
        throw new Error('Could not determine filename');
      }
    } catch (err) {
      console.error('[ERROR] Failed to get filename:', err);
      return null;
    }

    const fileExtension = path.extname(originalFilename);
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const newFilename = `${path.basename(originalFilename, fileExtension)}_${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadDir, newFilename);

    // Create upload directory if needed
    try {
      await fs.promises.mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.error('[ERROR] Failed to create upload directory:', err);
      return null;
    }

    // Move the file with proper error handling
    try {
      await fs.promises.rename(targetFile.filepath, filePath);
      console.log(`[SUCCESS] File saved to: ${filePath}`);
      return `/uploads/${newFilename}`;
    } catch (err) {
      console.error('[ERROR] Failed to save file:', err);
      
      // Clean up temp file if it exists
      if (targetFile.filepath) {
        try {
          await fs.promises.unlink(targetFile.filepath);
        } catch (unlinkErr) {
          console.error('[ERROR] Failed to clean up temp file:', unlinkErr);
        }
      }
      
      return null;
    }
  } catch (error) {
    console.error('[UNHANDLED ERROR] in saveFile:', error);
    return null;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Run the CORS middleware
  await runMiddleware(req, res, cors);

  // Handle OPTIONS requests (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Debug endpoint
  if (req.method === 'POST' && req.query.debug === 'true') {
    console.log('[DEBUG] Headers:', req.headers);
    return res.status(200).json({ 
      message: 'Debug endpoint hit',
      headers: req.headers
    });
  }

  // Check if the request is for the latest reviews
  if (req.method === 'GET' && req.query.latest === 'true') {
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
    // Verify the token
    const decoded = jwt.verify(token, secretKey) as { userId: string; role: string };
    const userId = parseInt(decoded.userId);

    if (req.method === 'GET') {
      try {
        let reviews;
        if (decoded.role === 'admin') {
          reviews = await prisma.review.findMany({
            include: {
              author: {
                select: {
                  name: true,
                },
              },
            },
          });
        } else {
          reviews = await prisma.review.findMany({
            where: { authorId: userId },
            include: {
              author: {
                select: {
                  name: true,
                },
              },
            },
          });
        }
        res.status(200).json(reviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
      }
    } else if (req.method === 'POST') {
      let formData;
      try {
        formData = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
          const form = new (require('formidable').IncomingForm)();
          form.parse(req, (err: any, fields: any, files: any) => {
            if (err) reject(err);
            resolve({ fields, files });
          });
        });

        console.log('[DEBUG] Form data received:', {
          fields: Object.keys(formData.fields),
          files: Object.keys(formData.files)
        });

        console.log('[DEBUG] File objects:', {
          image: debugFileObject(formData.files?.image),
          video: debugFileObject(formData.files?.video)
        });

        // Handle file uploads
        const imagePath = formData.files.image 
          ? await saveFile(formData.files.image)
          : null;

        const videoPath = formData.files.video 
          ? await saveFile(formData.files.video)
          : null;

        console.log('[DEBUG] File paths:', { imagePath, videoPath });

        // Validate required fields
        if (!formData.fields.targetId || !formData.fields.targetId[0]) {
          throw new Error('targetId is required');
        }

        const targetId = parseInt(formData.fields.targetId[0]);
        if (isNaN(targetId)) {
          throw new Error('Invalid targetId');
        }

        // Create review
        const review = await prisma.review.create({
          data: {
            entity: formData.fields.entity[0],
            rating: parseInt(formData.fields.rating[0]),
            title: formData.fields.title[0],
            content: formData.fields.content[0],
            review: formData.fields.review[0],
            tags: formData.fields.tags[0] ? formData.fields.tags[0].split(',').map((tag: string) => tag.trim()) : [],
            authorId: userId,
            targetId: targetId,
            imageUrl: imagePath,
            videoUrl: videoPath,
          },
        });

        console.log('[DEBUG] Review created:', review);
        res.status(201).json({ success: true, review });
      } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create review',
        });
      }
    } else if (req.method === 'DELETE') {
      if (decoded.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }

      const { id } = req.query;
      try {
        await prisma.review.delete({
          where: { id: Number(id) },
        });
        res.status(200).json({ message: 'Review deleted successfully' });
      } catch (error) {
        console.error('Failed to delete review:', error);
        res.status(500).json({ error: 'Failed to delete review' });
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Invalid token:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}