import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import initMiddleware from '../../../middleware/initMiddleware';
import Cors from 'cors';

// Initialize CORS middleware
const cors = initMiddleware(
  Cors({
    methods: ['GET', 'HEAD'],
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  })
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Fetch all support requests ordered by creation date (newest first)
    const supportRequests = await prisma.supportRequest.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        message: true,
        status: true,
        response: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Format dates for frontend
    const formattedRequests = supportRequests.map(request => ({
      ...request,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
    }));

    res.status(200).json(formattedRequests);
  } catch (error) {
    console.error('Error fetching support requests:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
