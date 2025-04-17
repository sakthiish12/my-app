import { NextRequest, NextResponse } from 'next/server';
import querystring from 'querystring';
import axios from 'axios';
import { cookies } from 'next/headers';
import { LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_REDIRECT_URI } from '@/lib/linkedin';

/**
 * LinkedIn OAuth callback handler
 * This is the EXACT path LinkedIn redirects to after authentication:
 * https://socioprice.com/api/auth/callback/linkedin (production)
 * http://localhost:3000/api/auth/callback/linkedin (development)
 * 
 * This must match the redirect_uri in the LinkedIn developer dashboard and in the authorization request.
 */
export async function GET(request: NextRequest) {
  console.log('LinkedIn callback handler accessed at /api/auth/callback/linkedin', { 
    url: request.url,
    searchParams: Object.fromEntries(request.nextUrl.searchParams.entries())
  });
  
  try {
    // Get search params from the request URL
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    console.log('[LinkedIn Callback] Parameters:', {
      code: code ? `${code.substring(0, 10)}...` : null,
      state,
      error,
      errorDescription
    });
    
    // Check for any errors coming from LinkedIn
    if (error) {
      console.error('[LinkedIn Callback] Error from LinkedIn:', error, errorDescription);
      return createHtmlResponse(false, {
        title: 'Authentication Failed',
        message: `LinkedIn returned an error: ${error}`,
        details: errorDescription || 'No additional details provided',
      });
    }

    // Verify state to prevent CSRF attacks
    const storedState = cookies().get('linkedin_oauth_state')?.value;
    if (!storedState || state !== storedState) {
      console.error('[LinkedIn Callback] State mismatch', { 
        received: state, 
        stored: storedState 
      });
      return createHtmlResponse(false, {
        title: 'Authentication Failed',
        message: 'Invalid state parameter',
        details: 'Security validation failed. Please try again.',
      });
    }
    
    // Clear the state cookie as it's no longer needed
    cookies().set('linkedin_oauth_state', '', { 
      maxAge: 0,
      path: '/',
    });

    // Check if authorization code is present
    if (!code) {
      console.error('[LinkedIn Callback] No authorization code received');
      return createHtmlResponse(false, {
        title: 'Authentication Failed',
        message: 'No authorization code received',
        details: 'Please try again or contact support if the issue persists.',
      });
    }

    // Exchange authorization code for access token
    console.log('[LinkedIn Callback] Exchanging code for token...');
    
    const tokenResponse = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, expires_in } = tokenResponse.data;
    
    if (!access_token) {
      throw new Error('No access token received');
    }

    console.log('[LinkedIn Callback] Token exchange successful');
    
    // Get user profile data
    const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });
    
    // Get user email data
    const emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });
    
    const profileData = profileResponse.data;
    const emailData = emailResponse.data;
    
    // Extract email from response
    const email = emailData?.elements?.[0]?.['handle~']?.emailAddress || null;
    
    // Create user data object
    const userData = {
      id: profileData.id,
      firstName: profileData.localizedFirstName,
      lastName: profileData.localizedLastName,
      email,
      accessToken: access_token,
      expiresIn: expires_in,
      provider: 'linkedin'
    };
    
    console.log('[LinkedIn Callback] User authenticated successfully:', {
      id: userData.id,
      name: `${userData.firstName} ${userData.lastName}`,
      email: userData.email
    });
    
    // In a production app, you would now:
    // 1. Create or update the user in your database
    // 2. Set authentication cookies or tokens
    // 3. Redirect to the appropriate page
    
    return createHtmlResponse(true, {
      title: 'Authentication Successful',
      message: `Welcome, ${userData.firstName}!`,
      details: 'You have successfully logged in with LinkedIn.',
      userData: userData
    });
    
  } catch (error) {
    console.error('[LinkedIn Callback] Token exchange error:', error);
    let errorMessage = 'Failed to exchange authorization code for access token';
    let errorDetails = 'Please try again or contact support.';
    
    if (axios.isAxiosError(error) && error.response) {
      console.error('[LinkedIn Callback] Response error:', error.response.data);
      errorDetails = error.response.data?.error_description || error.message;
    } else if (error instanceof Error) {
      errorDetails = error.message;
    }
    
    return createHtmlResponse(false, {
      title: 'Authentication Failed',
      message: errorMessage,
      details: errorDetails,
    });
  }
}

/**
 * Create an HTML response that can be displayed to the user
 */
function createHtmlResponse(success: boolean, options: {
  title: string;
  message: string;
  details?: string;
  userData?: any;
}) {
  const { title, message, details, userData } = options;
  
  // Generate a secure HTML response with styling
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          background-color: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          padding: 0 20px;
          color: #333;
        }
        .container {
          background-color: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
          max-width: 500px;
          width: 100%;
        }
        h1 {
          color: ${success ? '#0077b5' : '#e74c3c'};
          margin-top: 0;
        }
        .message {
          font-size: 1.2rem;
          margin: 20px 0;
        }
        .details {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 20px;
        }
        .button {
          background-color: ${success ? '#0077b5' : '#e74c3c'};
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .button:hover {
          background-color: ${success ? '#005e93' : '#c0392b'};
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${title}</h1>
        <div class="message">${message}</div>
        ${details ? `<div class="details">${details}</div>` : ''}
        <button class="button" onclick="closeWindow()">Continue to Dashboard</button>
      </div>
      
      <script>
        // Store user data as JSON string
        const userData = ${userData ? JSON.stringify(userData) : 'null'};
        
        // Function to close the window or redirect
        function closeWindow() {
          // Try to send a message to the opener window before closing
          if (window.opener && !window.opener.closed) {
            const message = {
              source: 'linkedin-oauth-callback',
              success: ${success},
              userData: userData
            };
            
            window.opener.postMessage(message, '*');
            console.log('Sent message to opener:', message);
            
            // Close this window after sending the message
            setTimeout(() => window.close(), 500);
          } else {
            // If no opener, redirect to the main application
            window.location.href = '${process.env.NEXT_PUBLIC_BASE_URL || '/'}';
          }
        }
        
        // Automatically send the message when the page loads
        window.addEventListener('DOMContentLoaded', function() {
          // Try to send a message to the opener window
          if (window.opener && !window.opener.closed) {
            const message = {
              source: 'linkedin-oauth-callback',
              success: ${success},
              userData: userData
            };
            
            window.opener.postMessage(message, '*');
            console.log('Sent message to opener:', message);
            
            // Auto close after a delay if success
            if (${success}) {
              setTimeout(() => window.close(), 2000);
            }
          }
        });
      </script>
    </body>
    </html>
  `;
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'x-clerk-bypass-middleware': '1' // Skip Clerk authentication
    }
  });
} 