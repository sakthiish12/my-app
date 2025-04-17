import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { LINKEDIN_REDIRECT_URI, getLinkedInAuthUrl } from '@/lib/linkedin';

/**
 * Endpoint to get LinkedIn auth URL for popup authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Generate a random state for CSRF protection
    const state = Array.from(
      new Uint8Array(16),
      byte => byte.toString(16).padStart(2, '0')
    ).join('');
    
    // Save state in a cookie for verification during callback
    cookies().set('linkedin_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 300, // 5 minutes
      path: '/',
    });
    
    // Get the authorization URL using the LinkedIn library function
    const authUrl = getLinkedInAuthUrl(LINKEDIN_REDIRECT_URI, state);
    
    console.log('LinkedIn auth URL generated with redirect_uri:', LINKEDIN_REDIRECT_URI);
    
    // Return the auth URL without redirecting
    return NextResponse.json(
      { url: authUrl },
      { 
        headers: {
          'x-clerk-bypass-middleware': '1' // Skip Clerk authentication
        }
      }
    );
    
  } catch (error) {
    console.error('LinkedIn get auth URL error:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        error: 'Failed to generate LinkedIn auth URL',
        details: (error as Error).message
      }, 
      { 
        status: 500,
        headers: {
          'x-clerk-bypass-middleware': '1'
        }
      }
    );
  }
} 