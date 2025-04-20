// pages/api/admin/users.ts
// import { NextApiRequest, NextApiResponse } from 'next';
// import { PrismaClient } from '@prisma/client';
// import Cors from 'cors';
// import jwt from 'jsonwebtoken';

// const prisma = new PrismaClient();
// const secretKey = '54b6b0d3a9a1d639b0797cac96e96623c832ca5952bcc12449604c98d59c08cf22edec3379e0203564346c68dc7e9dc16905e4328e3d65c7e6a53f743401dd44'; // Use the same secret as in your token generation

// // Initialize CORS middleware
// const cors = Cors({
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   origin: ['http://localhost:5173', 'http://localhost:5174']
// });

// // Helper to run middleware
// function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
//   return new Promise((resolve, reject) => {
//     fn(req, res, (result: any) => {
//       if (result instanceof Error) {
//         return reject(result);
//       }
//       return resolve(result);
//     });
//   });
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   // Run CORS middleware first
//   await runMiddleware(req, res, cors);

//   // Handle OPTIONS requests
//   if (req.method === 'OPTIONS') {
//     return res.status(200).end();
//   }

//   // Extract and validate token
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) {
//     return res.status(401).json({ error: 'Unauthorized: No token provided' });
//   }

//   try {
//     // Verify token
//     const decoded = jwt.verify(token, secretKey) as { userId: string; role: string };
    
//     // Check if user has admin role
//     if (decoded.role !== 'admin') {
//       return res.status(403).json({ error: 'Forbidden: Admin access required' });
//     }

//     // Token is valid and user is admin, proceed with request
//     if (req.method === 'GET') {
//       try {
//         const users = await prisma.user.findMany();
//         return res.status(200).json(users);
//       } catch (error) {
//         console.error('Error fetching users:', error);
//         return res.status(500).json({ error: 'Failed to fetch users' });
//       }
//     } else if (req.method === 'DELETE') {
//       const { id } = req.query;

//       try {
//         await prisma.user.delete({
//           where: { id: Number(id) },
//         });
//         return res.status(200).json({ message: 'User deleted successfully' });
//       } catch (error) {
//         console.error('Error deleting user:', error);
//         return res.status(500).json({ error: 'Failed to delete user' });
//       }
//     } else {
//       return res.status(405).json({ error: 'Method not allowed' });
//     }

//   } catch (error) {
//     console.error('Authentication error:', error);
//     return res.status(401).json({ error: 'Unauthorized: Invalid token' });
//   }
// }







// pages/api/admin/users.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import Cors from 'cors';
import jwt from 'jsonwebtoken';
import errorMiddleware from '../middlewareError'; // Import the error handler

const prisma = new PrismaClient();
const secretKey = process.env.JWT_SECRET; // Get from env
const adminUserId = 1; // Get the id of the admin

// Initialize CORS middleware
const cors = Cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Add OPTIONS
  origin: ['http://localhost:5173', 'http://localhost:5174']
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

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Run CORS middleware first
  await runMiddleware(req, res, cors);

  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract and validate token
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, secretKey!) as { userId: number };

    // Check if user has admin role
    if (decoded.userId !== adminUserId) { //Check if it's the admin user
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    // Token is valid and user is admin, proceed with request
    if (req.method === 'GET') {
      const users = await prisma.user.findMany();
      return res.status(200).json(users);
    } else if (req.method === 'DELETE') {
      const { id } = req.query;

      await prisma.user.delete({
        where: { id: Number(id) },
      });
      return res.status(200).json({ message: 'User deleted successfully' });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
          return res.status(401).json({ error: 'Token expired' });
      } else if (error instanceof jwt.JsonWebTokenError) {
          return res.status(401).json({ error: 'Invalid token' });
      }
      console.error('Authentication error:', error);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}
export default errorMiddleware(handler); // Now the handler is wrapped by the errorMiddleware