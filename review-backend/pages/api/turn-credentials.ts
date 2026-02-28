import type { NextApiRequest, NextApiResponse } from 'next';
import { generateTurnCredentials, validateTurnConfig } from '../../utils/turnCredentials';

interface TurnCredentialsResponse {
  success: boolean;
  username?: string;
  credential?: string;
  ttl?: number;
  urls?: string[];
  error?: string;
}

/**
 * API endpoint to generate dynamic TURN credentials
 * GET /api/turn-credentials
 * 
 * Returns time-limited TURN credentials for WebRTC connections
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TurnCredentialsResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET request.'
    });
  }

  try {
    // Validate TURN configuration
    if (!validateTurnConfig()) {
      return res.status(500).json({
        success: false,
        error: 'TURN server not configured properly. Check environment variables.'
      });
    }

    // Get static secret from environment
    const secret = process.env.TURN_STATIC_SECRET as string;
    
    // Generate credentials (6 hours TTL)
    const credentials = generateTurnCredentials(secret, 21600);
    
    // Set CORS headers to allow frontend access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Return credentials
    return res.status(200).json({
      success: true,
      ...credentials
    });
    
  } catch (error) {
    console.error('Error generating TURN credentials:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to generate TURN credentials'
    });
  }
}
