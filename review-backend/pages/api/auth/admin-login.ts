// pages/api/auth/admin-login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Cors from 'cors';

// Initialize the CORS middleware
const cors = Cors({
  origin: 'http://localhost:5174', // Allow requests from this origin
  methods: ['POST'], // Allow only POST requests
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

const secretKey = process.env.JWT_SECRET!;

// Get admin credentials from environment variables
const ADMIN_NAME = process.env.ADMIN_NAME!;
const ADMIN_PASSWORD_HASH = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 10); // Hash the password

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Run the CORS middleware
  await runMiddleware(req, res, cors);

  if (req.method === 'POST') {
    const { name, password } = req.body;

    try {
      // Validate admin credentials
      if (name !== ADMIN_NAME || !(await bcrypt.compare(password, ADMIN_PASSWORD_HASH))) {
        return res.status(401).json({ error: 'Invalid admin credentials' });
      }

      // Generate a token for the admin
      const token = jwt.sign(
        { userId: 'admin', role: 'admin' }, // Include admin role in the token
        secretKey,
        { expiresIn: '1h' } // Token expires in 1 hour
      );

      // Return the token to the client
      res.status(200).json({ 
        token,
        redirectTo: '/' // Always redirect to admin dashboard
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}