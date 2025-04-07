import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import LinkedInAuthService from '@/services/LinkedInAuthService';

// Mock function for development to replace actual token storage
const mockSaveTokens = async (userId: string, tokens: any) => {
  console.log('Development mode: Mocking token storage for user', userId);
  // In development, we don't actually save tokens to DB
  return;
};

// HTML template for success closure
const generateSuccessHTML = (state: string) => `
<!DOCTYPE html>
<html>
<head>
  <title>LinkedIn Authentication Success</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; text-align: center; padding-top: 50px; }
    .success { color: #28a745; font-size: 48px; margin-bottom: 20px; }
    p { color: #333; }
  </style>
</head>
<body>
  <div class="success">✓</div>
  <h2>Authentication Successful</h2>
  <p>You can close this window and return to the application.</p>
  <script>
    // Redirect the opener window and close this one
    if (window.opener) {
      window.opener.location.href = "/dashboard/linkedin?oauth=success&state=${state}";
      window.close();
    } else {
      // If no opener, redirect this window
      window.location.href = "/dashboard/linkedin?oauth=success&state=${state}";
    }
  </script>
</body>
</html>
`;

// HTML template for error closure
const generateErrorHTML = (error: string) => `
<!DOCTYPE html>
<html>
<head>
  <title>LinkedIn Authentication Error</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; text-align: center; padding-top: 50px; }
    .error { color: #dc3545; font-size: 48px; margin-bottom: 20px; }
    p { color: #333; }
    .error-message { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 10px; border-radius: 4px; margin: 20px auto; max-width: 500px; }
  </style>
</head>
<body>
  <div class="error">✗</div>
  <h2>Authentication Failed</h2>
  <div class="error-message">${error}</div>
  <p>You can close this window and try again.</p>
  <script>
    // Redirect the opener window and close this one
    if (window.opener) {
      window.opener.location.href = "/dashboard/linkedin?error=${encodeURIComponent(error)}";
      window.close();
    } else {
      // If no opener, redirect this window
      window.location.href = "/dashboard/linkedin?error=${encodeURIComponent(error)}";
    }
  </script>
</body>
</html>
`;

export async function GET(request: Request) {
  try {
    // Log the complete URL for debugging
    console.log('LinkedIn OAuth callback URL:', request.url);
    
    // Extract the URL parts we need
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');
    
    // Log params for debugging
    console.log('LinkedIn OAuth params:', { 
      code: code ? 'present' : 'missing', 
      state: state ? 'present' : 'missing',
      error, 
      errorDescription 
    });
    
    // Handle error case from LinkedIn
    if (error) {
      console.error('LinkedIn OAuth error:', error, errorDescription);
      // Return HTML error page for popup to handle
      return new NextResponse(
        generateErrorHTML(errorDescription || error),
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }
    
    // Verify code exists
    if (!code) {
      console.error('Missing code in LinkedIn callback');
      return new NextResponse(
        generateErrorHTML('Missing authorization code'),
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }
    
    // Optional check for userId - can be skipped in development
    const { userId } = auth();
    const isAuthenticated = !!userId;
    console.log('User authentication status:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
    
    // Exchange code for access token - even if we don't save it
    try {
      const tokens = await LinkedInAuthService.getAccessToken(code);
      console.log('Successfully obtained LinkedIn tokens');
      
      // In development: don't require auth/MongoDB saving
      if (isAuthenticated) {
        try {
          await LinkedInAuthService.saveTokens(userId, tokens);
          console.log('Successfully saved LinkedIn tokens to database');
        } catch (dbError) {
          // If database saving fails, log but continue - use mock function
          console.error('Error saving to database, using mock function:', dbError);
          await mockSaveTokens(userId, tokens);
        }
      } else {
        // Development mode without authentication
        console.log('Development mode: Skipping token storage (no auth)');
      }
      
      // Try to get profile info - not critical
      try {
        const profile = await LinkedInAuthService.getProfile(tokens.accessToken);
        console.log('LinkedIn profile retrieved:', profile.id);
      } catch (profileError) {
        console.error('Error fetching LinkedIn profile:', profileError);
        // Continue anyway, as this is not critical
      }
      
      // Return success HTML for popup to handle
      return new NextResponse(
        generateSuccessHTML(state || ''),
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    } catch (tokenError) {
      console.error('Error exchanging code for token:', tokenError);
      return new NextResponse(
        generateErrorHTML('Failed to exchange authorization code for access token'),
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }
    
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    return new NextResponse(
      generateErrorHTML('An unexpected error occurred'),
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
} 