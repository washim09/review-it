// File: utils/cors.ts

import { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';

const cors = Cors({
  methods: ['GET', 'OPTIONS'],
  origin: 'http://localhost:5173', // Replace with your allowed origins if needed
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Add this line to allow credentials
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export function withCors(handler: any) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    await runMiddleware(req, res, cors);
    // Continue to run the handler
    return handler(req, res);
  };
}