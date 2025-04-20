import { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';

// Initialize the CORS middleware
const cors = Cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true, // Allow cookies and authentication headers
});

// Helper method to run CORS middleware
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
  // Run the middleware
  await runMiddleware(req, res, cors);

  // Your API logic here
  res.json({ message: 'CORS-enabled API route' });
}
