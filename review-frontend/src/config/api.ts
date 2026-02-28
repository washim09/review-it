// Centralized API configuration
// Reads from NEXT_PUBLIC_API_URL env var, falls back to production
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.riviewit.com';
