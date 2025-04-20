// This file handles user login and token generation
// It uses Prisma for database access, bcrypt for password hashing, and jsonwebtoken for token generation
// It also includes CORS middleware for handling cross-origin requests
// Import necessary modules and types

// import { NextApiRequest, NextApiResponse } from 'next';
// import { PrismaClient } from '@prisma/client';
// import bcrypt from 'bcryptjs'; // Use bcryptjs instead of bcrypt
// import Cors from 'cors';
// import jwt from 'jsonwebtoken'; // Import jsonwebtoken

// const prisma = new PrismaClient();

// // Initialize the cors middleware
// const cors = Cors({
//   methods: ['POST', 'GET', 'HEAD'],
//   origin: 'http://localhost:5173', // Allow requests from this origin
// });

// // Helper method to wait for a middleware to execute before continuing
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
//   await runMiddleware(req, res, cors);

//   if (req.method === 'POST') {
//     try {
//       const { email, password } = req.body;

//       // Debug logging
//       console.log('Login attempt for:', email);
//       console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

//       const user = await prisma.user.findUnique({ 
//         where: { email },
//         select: { id: true, password: true, name: true, email: true }
//       });

//       if (user && await bcrypt.compare(password, user.password)) {
//         // Enhanced logging
//         console.log('User found:', user.id);
//         console.log('Token payload:', { userId: user.id });
        
//         const token = jwt.sign(
//           { userId: user.id },
//           process.env.JWT_SECRET!,
//           { expiresIn: '1h' }
//         );

//         console.log('Generated token:', token.slice(0, 20) + '...'); // Log partial token

//         return res.status(200).json({
//           token,
//           user: {
//             id: user.id,
//             name: user.name,
//             email: user.email
//           }
//         });
//       }

//       console.warn('Invalid credentials for:', email);
//       return res.status(401).json({ error: 'Invalid credentials' });

//     } catch (error) {
//       console.error('Login Error:', {
//         error: error instanceof Error ? error.message : 'Unknown error',
//         stack: error instanceof Error ? error.stack : null
//       });
//       return res.status(500).json({ error: 'Login failed' });
//     }
//   }
  
//   return res.status(405).json({ message: 'Method not allowed' });
// }





// pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // Use bcryptjs instead of bcrypt
import Cors from 'cors';
import jwt from 'jsonwebtoken'; // Import jsonwebtoken
import errorMiddleware from '../middlewareError'; // Import the error handler

const prisma = new PrismaClient();
const secretKey = process.env.JWT_SECRET; // Get from env

// Initialize the cors middleware
const cors = Cors({
    methods: ['POST', 'GET', 'HEAD', 'OPTIONS'], // Add OPTIONS
    origin: 'http://localhost:5173', // Allow requests from this origin
});

// Helper method to wait for a middleware to execute before continuing
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
    await runMiddleware(req, res, cors);
    // Handle OPTIONS requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method === 'POST') {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, password: true, name: true, email: true } // Removed role
        });

        if (user && await bcrypt.compare(password, user.password)) {

            const token = jwt.sign(
                { userId: user.id }, // Removed role
                secretKey!,
                { expiresIn: '1h' }
            );

            return res.status(200).json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                }
            });
        }

        return res.status(401).json({ error: 'Invalid credentials' });

    }

    return res.status(405).json({ message: 'Method not allowed' });
}
export default errorMiddleware(handler); // Now the handler is wrapped by the errorMiddleware