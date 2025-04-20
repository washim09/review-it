// pages/api/middlewareError.ts
import { NextApiRequest, NextApiResponse } from 'next';

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void | NextApiResponse>;

const errorMiddleware = (handler: ApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Check if response has already been sent
    if (res.writableEnded) return;

    await handler(req, res);

    // If handler didn't send a response, assume it's an error
    if (!res.writableEnded) {
      throw new Error('No response sent from handler');
    }
  } catch (error) {
    console.error('API Error:', {
      url: req.url,
      method: req.method,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    // Don't send another response if one has already been sent
    if (res.writableEnded) return;

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized') || error.message.includes('Invalid token')) {
        return res.status(401).json({ error: error.message });
      }
      if (error.message.includes('Not found')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('Bad request')) {
        return res.status(400).json({ error: error.message });
      }
    }

    // Default to 500 internal server error
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default errorMiddleware;