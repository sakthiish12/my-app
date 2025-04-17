import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  try {
    // Log the request details for debugging
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    console.log('LinkedIn callback-debug route accessed', {
      hasCode: !!code,
      state,
      error,
      errorDescription,
      fullUrl: req.url
    });

    // Log all query parameters
    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      queryParams[key] = key === 'code' ? `${value.substring(0, 10)}...` : value;
    });
    
    // Process the LinkedIn OAuth callback
    let tokenInfo = null;
    let tokenError = null;
    
    if (code && !error) {
      try {
        // Exchange the code for an access token
        const tokenResponse = await axios.post(
          'https://www.linkedin.com/oauth/v2/accessToken',
          new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            client_id: process.env.LINKEDIN_CLIENT_ID || '',
            client_secret: process.env.LINKEDIN_CLIENT_SECRET || '',
            redirect_uri: process.env.LINKEDIN_CALLBACK_URL || `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/linkedin`,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        
        tokenInfo = {
          access_token: `${tokenResponse.data.access_token.substring(0, 10)}...`,
          expires_in: tokenResponse.data.expires_in,
          received_at: new Date().toISOString()
        };
        
        console.log('LinkedIn token exchange successful', {
          tokenReceived: true,
          expiresIn: tokenResponse.data.expires_in
        });
      } catch (tokenError: any) {
        console.error('LinkedIn token exchange error:', 
          tokenError.response?.data || tokenError.message);
        
        tokenError = {
          message: tokenError.message,
          response: tokenError.response?.data || null
        };
      }
    }
    
    // Return all debugging information as JSON
    return NextResponse.json({
      status: error ? 'error' : 'success',
      message: error 
        ? `LinkedIn OAuth error: ${error}` 
        : 'LinkedIn callback processing completed',
      debug: {
        timestamp: new Date().toISOString(),
        queryParams,
        headers: Object.fromEntries(req.headers),
        envVars: {
          LINKEDIN_CLIENT_ID: !!process.env.LINKEDIN_CLIENT_ID,
          LINKEDIN_CLIENT_SECRET: !!process.env.LINKEDIN_CLIENT_SECRET,
          CALLBACK_URL: process.env.LINKEDIN_CALLBACK_URL,
          BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
        }
      },
      tokenInfo,
      tokenError,
      error: error ? { code: error, description: errorDescription } : null
    });
  } catch (err) {
    console.error('LinkedIn callback-debug error:', err);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Error processing LinkedIn callback', 
      error: (err as Error).message 
    }, { status: 500 });
  }
} 