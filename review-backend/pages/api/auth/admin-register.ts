// API route for admin registration
import { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import { registerAdmin } from '../../../controllers/adminAuthController';

// Initialize the CORS middleware
const cors = Cors({
  origin: ['https://admin.riviewit.com', 'https://www.riviewit.com', 'https://api.riviewit.com', 'https://riviewit.com', 'http://localhost:5174'], // Allow requests from these origins
  methods: ['POST', 'OPTIONS'], // Allow POST and OPTIONS requests
  credentials: true, // Allow credentials (e.g., cookies)
});

// Helper method to run the CORS middleware
const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: Function) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Run the CORS middleware first
  await runMiddleware(req, res, cors);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'POST') {
    return registerAdmin(req, res);
  }
  
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
