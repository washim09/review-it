// utils/authUtils.ts
import jwt from 'jsonwebtoken';
import { Secret } from 'jsonwebtoken';

// Define the secret
const JWT_SECRET = (process.env.JWT_SECRET || 'default_secret') as Secret;

export interface TokenResult {
  userId: number | null;
  error?: string;
  isExpired?: boolean;
}

/**
 * Parse and verify JWT token to get user ID
 * - Handles expired tokens by still extracting the userId when possible
 * - Returns detailed information about token validity
 */
export function verifyToken(token: string): TokenResult {
  try {
    // Verify token with JWT
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return { userId: decoded.userId };
  } catch (error) {
    // Check if this is specifically a token expiration error
    if (error instanceof jwt.TokenExpiredError) {
      // We expect token expiration, so no need to log it as an error
      // This is a normal part of the token lifecycle that we handle gracefully
      
      // For expired tokens, we can still decode them without verification to get the userId
      try {
        const decodedExpired = jwt.decode(token) as { userId: number };
        if (decodedExpired && decodedExpired.userId) {
          return { 
            userId: decodedExpired.userId, 
            error: 'Token expired', 
            isExpired: true 
          };
        }
      } catch (decodeError) {
        console.error('Failed to decode expired token:', decodeError);
      }
      
      return { userId: null, error: 'Token expired', isExpired: true };
    }
    
    // Log other JWT errors that aren't expiration errors
    console.error('JWT verification error:', error);
    return { userId: null, error: 'Invalid token' };
  }
}

/**
 * Generate a new JWT token for a user
 */
export function generateToken(userId: number, expiresIn = '24h'): string {
  const payload = { userId };
  
  // Use proper type assertion for the options object
  const options = { expiresIn } as jwt.SignOptions;
  
  // Now use the properly typed variables
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Extract token from authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.split(' ')[1];
}
