import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * LinkedIn connect endpoint
 * Redirects to LinkedIn OAuth authorization page
 */
export async function GET(request: NextRequest) {
  console.log('LinkedIn connect endpoint accessed');
  
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
    
    // Build LinkedIn authorization URL
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.LINKEDIN_CALLBACK_URL;
    
    if (!clientId || !redirectUri) {
      throw new Error('LinkedIn configuration is missing');
    }
    
    // Use the exact URI that's registered with LinkedIn
    // IMPORTANT: This must match what's registered in the LinkedIn Developer Console
    const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', 'r_liteprofile r_emailaddress');
    
    console.log('Redirecting to LinkedIn OAuth:', authUrl.toString());
    
    // Redirect to LinkedIn for authentication
    return NextResponse.redirect(authUrl.toString(), {
      headers: {
        'x-clerk-bypass-middleware': '1' // Skip Clerk authentication
      }
    });
    
  } catch (error) {
    console.error('LinkedIn connect error:', error);
    
    // Redirect to error page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/sign-in?error=LinkedInConnectError`, {
      headers: {
        'x-clerk-bypass-middleware': '1'
      }
    });
  }
} 