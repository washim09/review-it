import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { runCorsMiddleware } from '../../../lib/cors-middleware';
import path from 'path';
import fs from 'fs-extra';

const prisma = new PrismaClient();

// Using centralized CORS middleware from ../cors-middleware.ts

const JWT_SECRET = process.env.JWT_SECRET || '54b6b0d3a9a1d639b0797cac96e96623c832ca5952bcc12449604c98d59c08cf22edec3379e0203564346c68dc7e9dc16905e4328e3d65c7e6a53f743401dd44';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply the centralized CORS middleware
  await runCorsMiddleware(req, res);

  // Handle OPTIONS requests (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract the review ID from the URL
  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid review ID' });
  }
  
  const reviewId = parseInt(id);
  if (isNaN(reviewId)) {
    return res.status(400).json({ error: 'Review ID must be a number' });
  }

  // For all requests, require authentication
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    const userId = parseInt(decoded.userId);
    const isAdmin = decoded.role === 'admin';

    // GET request - retrieve a specific review
    if (req.method === 'GET') {
      try {
        const review = await prisma.review.findUnique({
          where: { id: reviewId },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        });

        if (!review) {
          return res.status(404).json({ error: 'Review not found' });
        }

        // Format the response with properly structured data
        const formattedReview = {
          ...review,
          createdAt: review.createdAt.toISOString(),
        };

        return res.status(200).json(formattedReview);
      } catch (error) {
        console.error('Error fetching review:', error);
        return res.status(500).json({ error: 'Failed to fetch review' });
      }
    }
    
    // DELETE request - delete a specific review
    else if (req.method === 'DELETE') {
      try {
        // Find the review first to check ownership
        const review = await prisma.review.findUnique({
          where: { id: reviewId },
        });

        if (!review) {
          return res.status(404).json({ error: 'Review not found' });
        }

        // Check if the user is authorized to delete this review
        if (!isAdmin && review.authorId !== userId) {
          return res.status(403).json({ error: 'Forbidden: You can only delete your own reviews' });
        }

        // Delete the review
        await prisma.review.delete({
          where: { id: reviewId },
        });

        return res.status(200).json({ message: 'Review deleted successfully' });
      } catch (error) {
        console.error('Failed to delete review:', error);
        return res.status(500).json({ error: 'Failed to delete review' });
      }
    }
    
    // PUT request - update a specific review
    else if (req.method === 'PUT') {
      try {
        // CRITICAL: Print the entire request body for debugging

        // Find the review first to check ownership
        const review = await prisma.review.findUnique({
          where: { id: reviewId },
        });

        if (!review) {
          return res.status(404).json({ error: 'Review not found' });
        }

        // Check if the user is authorized to update this review
        if (!isAdmin && review.authorId !== userId) {
          return res.status(403).json({ error: 'Forbidden: You can only update your own reviews' });
        }
        
        // Print current review state before update

        // DIRECT APPROACH: Build update object directly from request body
        const contentFromRequest = req.body.content;
        const reviewFromRequest = req.body.review;
        const nextMediaUrls = Array.isArray(req.body.mediaUrls) ? req.body.mediaUrls : undefined;
        const deletedMediaUrls = Array.isArray(req.body.deletedMediaUrls) ? req.body.deletedMediaUrls : [];

        // Force update with raw data to ensure content is updated
        const updateData = {
          title: req.body.title || review.title,
          // CRITICAL: Force content update from request body
          content: contentFromRequest || review.content,
          // Use the separate review field for detailed text
          review: reviewFromRequest || review.review,
          rating: req.body.rating !== undefined ? Number(req.body.rating) : review.rating,
          tags: Array.isArray(req.body.tags) ? req.body.tags : (review.tags || []),
          entity: req.body.entity || review.entity,
          // CRITICAL: Update media URLs (support deletion by setting to null)
          mediaUrls: nextMediaUrls !== undefined ? nextMediaUrls : review.mediaUrls,
          imageUrl: req.body.imageUrl !== undefined ? req.body.imageUrl : review.imageUrl,
          videoUrl: req.body.videoUrl !== undefined ? req.body.videoUrl : review.videoUrl
        };

        // Update the review with the forced fields
        // Use direct SQL query if necessary to ensure the update happens
        const updatedReview = await prisma.review.update({
          where: { id: reviewId },
          data: updateData,
        });
        
        const uploadsDir = process.env.UPLOADS_PATH || path.join(process.cwd(), 'public', 'uploads');

for (const url of deletedMediaUrls) {
  // only delete local uploads
  if (typeof url !== 'string') continue;

  // support absolute URLs and relative URLs
  const idx = url.indexOf('/uploads/');
  const relative = idx >= 0 ? url.substring(idx) : url;

  if (!relative.startsWith('/uploads/')) continue;

  // ensure no other review uses it
  const stillUsed = await prisma.review.count({
    where: {
      id: { not: reviewId },
      mediaUrls: { has: relative },
    },
  });

  if (stillUsed > 0) continue;

  const filename = relative.replace('/uploads/', '');
  const filePath = path.join(uploadsDir, filename);

  try {
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
  } catch (e) {
    console.error('Failed to delete media file:', { url, filePath, error: e });
  }
}

        // Print the review after update to confirm changes

        return res.status(200).json(updatedReview);
      } catch (error) {
        console.error('Failed to update review:', error);
        return res.status(500).json({ error: 'Failed to update review' });
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
