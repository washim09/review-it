import crypto from 'crypto';

interface TurnCredentials {
  username: string;
  credential: string;
  ttl: number;
  urls: string[];
}

/**
 * Generate dynamic TURN credentials using HMAC SHA1
 * This follows the standard used by Twilio, Google, etc.
 * 
 * @param secret - The static auth secret from Coturn config
 * @param ttl - Time to live in seconds (default: 6 hours)
 * @returns TURN credentials object
 */
export function generateTurnCredentials(
  secret: string,
  ttl: number = 21600 // 6 hours default
): TurnCredentials {
  // Calculate expiration timestamp
  const unixTimeStamp = Math.floor(Date.now() / 1000) + ttl;
  
  // Create username with timestamp (format: timestamp:randomuser)
  const username = `${unixTimeStamp}:turnuser`;
  
  // Generate HMAC SHA1 credential
  const hmac = crypto.createHmac('sha1', secret);
  hmac.update(username);
  const credential = hmac.digest('base64');
  
  // Get TURN URLs from environment
  const turnUrls = [
    process.env.TURN_URL_UDP || 'turn:turn.riviewit.com:3478?transport=udp',
    process.env.TURN_URL_TCP || 'turn:turn.riviewit.com:3478?transport=tcp',
    process.env.TURN_URL_TLS || 'turns:turn.riviewit.com:5349?transport=tcp'
  ];
  
  return {
    username,
    credential,
    ttl,
    urls: turnUrls
  };
}

/**
 * Validate TURN credentials configuration
 * Ensures all required environment variables are set
 */
export function validateTurnConfig(): boolean {
  const required = ['TURN_STATIC_SECRET'];
  
  for (const key of required) {
    if (!process.env[key]) {
      console.error(`❌ Missing required environment variable: ${key}`);
      return false;
    }
  }
  
  return true;
}
