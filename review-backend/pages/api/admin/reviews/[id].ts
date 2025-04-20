import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Cors from 'cors';

const prisma = new PrismaClient();

// Initialize the CORS middleware
const cors = Cors({
  methods: ['DELETE'], // Allow DELETE requests
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Allow requests from your frontend origins
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Run the CORS middleware
  await runMiddleware(req, res, cors);

  const { id } = req.query;

  if (req.method === 'DELETE') {
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
    res.status(405).json({ message: 'Method not allowed' });
  }
}