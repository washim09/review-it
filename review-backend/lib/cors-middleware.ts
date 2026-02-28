// Shared CORS middleware for all API routes
import { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';

// Create a robust CORS configuration that works across all environments
export const corsMiddleware = Cors({
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Include all methods you need
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Define allowed origins - include development and production
    const allowedOrigins = [
      'https://riviewit.com',
      'https://www.riviewit.com',
      'https://admin.riviewit.com',
      'https://api.riviewit.com',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000'
    ];
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {

      // Optionally allow all origins for development
      // callback(null, true);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
});

// Helper method to run middleware
export function runCorsMiddleware(req: NextApiRequest, res: NextApiResponse) {
  return new Promise<void>((resolve, reject) => {
    // First, apply direct CORS headers for immediate effect
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Handle origin more robustly - prioritize production domains
    const origin = req.headers.origin || '';
    const allowedOrigins = [
      'https://riviewit.com',
      'https://www.riviewit.com', 
      'https://admin.riviewit.com',
      'https://api.riviewit.com',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000'
    ];
    
    // Always prioritize production domain for riviewit.com
    if (origin === 'https://riviewit.com' || origin === 'https://www.riviewit.com') {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      // Default to production domain
      res.setHeader('Access-Control-Allow-Origin', 'https://riviewit.com');
    }
    
    
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers', 
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );
    
    // Handle preflight requests immediately
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return resolve();
    }

    // Then run cors middleware
    corsMiddleware(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve();
    });
  });
}
