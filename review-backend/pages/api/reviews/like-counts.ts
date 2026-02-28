import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { runCorsMiddleware } from '../../../lib/cors-middleware';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apply CORS middleware
  await runCorsMiddleware(req, res);

  // Handle OPTIONS requests (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { reviewIds } = req.body;

    // Validate request body
    if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
      return res.status(400).json({ message: 'reviewIds must be a non-empty array' });
    }

    // Convert all IDs to numbers and filter out any invalid ones
    const validReviewIds = reviewIds
      .map(id => {
        const numId = Number(id);
        return isNaN(numId) ? null : numId;
      })
      .filter((id): id is number => id !== null);

    if (validReviewIds.length === 0) {
      return res.status(400).json({ message: 'No valid review IDs provided' });
    }

    // Get like counts for all valid review IDs
    const likeCounts = await prisma.like.groupBy({
      by: ['reviewId'],
      where: {
        reviewId: {
          in: validReviewIds
        }
      },
      _count: {
        reviewId: true
      }
    });

    // Convert to a map of reviewId -> count
    const countsMap = likeCounts.reduce<Record<string, number>>((acc, item) => {
      acc[item.reviewId.toString()] = item._count.reviewId;
      return acc;
    }, {});

    // Include all requested review IDs in the response, with 0 for those with no likes
    const result = validReviewIds.reduce<Record<string, number>>((acc, id) => {
      acc[id.toString()] = countsMap[id] || 0;
      return acc;
    }, {});

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching like counts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
