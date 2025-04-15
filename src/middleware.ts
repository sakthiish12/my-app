import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from 'next/server';

// Get the production domain from environment variable
const PRODUCTION_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://socioprice.com';

export default authMiddleware({
  // Allow 5 minutes of clock skew for checking JWT expiration times
  clockSkewInMs: 300000,
  debug: process.env.NODE_ENV === 'development',
  publicRoutes: [
    '/', 
    '/sign-in', 
    '/sign-up', 
    '/api/webhooks/clerk',
    '/api/auth/linkedin/callback',
    // LinkedIn callback must be public - adding with wildcard to match all query params
    '/api/auth/linkedin/callback(.*)',
    // Debug endpoints
    '/api/test-db',
    '/api/auth/linkedin/debug',
  ],
  afterAuth(auth, req) {
    // Security check for production - only allow requests from production domain or localhost
    const url = req.nextUrl.clone();
    const hostname = req.headers.get('host') || '';
    const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');
    const isProductionDomain = hostname.includes(PRODUCTION_URL.replace('https://', ''));
    
    // Additional security check for production environment
    if (process.env.NODE_ENV === 'production' && !isProductionDomain && !isLocalhost) {
      console.warn(`Blocked request from unauthorized domain: ${hostname}`);
      url.pathname = '/sign-in';
      return NextResponse.rewrite(url);
    }
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 