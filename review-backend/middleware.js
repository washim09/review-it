// middleware.js - Next.js middleware for handling CORS
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the origin from the request
  const origin = request.headers.get('origin') || '';
  
  // Define allowed origins with production priority
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
  
  // Get next response
  const response = NextResponse.next();
  
  // Set CORS headers for all responses with proper origin validation
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  // Prioritize production domains
  if (origin === 'https://riviewit.com' || origin === 'https://www.riviewit.com') {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else if (allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else {
    response.headers.set('Access-Control-Allow-Origin', 'https://riviewit.com');
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version');
  
  
  // Handle OPTIONS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers,
    });
  }
  
  return response;
}

// Match all API routes and uploads
export const config = {
  matcher: ['/api/:path*', '/uploads/:path*'],
};
