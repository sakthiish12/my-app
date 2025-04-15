import { NextRequest } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const LINKEDIN_CLIENT_ID = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/linkedin/callback`;
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const STATE_COOKIE_NAME = 'linkedin_oauth_state';

// This is a simplified callback that doesn't require database connection
export async function GET(request: NextRequest) {
  console.log('LinkedIn callback initiated - PUBLIC ROUTE - SIMPLIFIED VERSION');
  
  try {
    const cookieStore = cookies();
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    
    console.log("LinkedIn Callback Params:", { 
      code: code ? code.slice(0, 10) + '...' : null,
      state, 
      error,
      cookies: Array.from(cookieStore.getAll()).map(c => c.name)
    });

    // Validate state param to prevent CSRF
    const storedState = cookieStore.get(STATE_COOKIE_NAME)?.value;
    if (!state || !storedState || state !== storedState) {
      return createResponseHtml(false, "Invalid state parameter. Please try again.");
    }
    
    // Clean up cookie
    cookieStore.delete(STATE_COOKIE_NAME);
    
    // Handle errors from LinkedIn
    if (error) {
      return createResponseHtml(false, `LinkedIn error: ${error}`);
    }
    
    // Validate code parameter
    if (!code) {
      return createResponseHtml(false, "No authorization code received");
    }
    
    // Exchange code for access token
    console.log("Exchanging code for token...");
    let tokenData;
    try {
      const response = await axios.post(
        LINKEDIN_TOKEN_URL,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: LINKEDIN_CLIENT_ID || '',
          client_secret: LINKEDIN_CLIENT_SECRET || '',
          redirect_uri: REDIRECT_URI,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      tokenData = response.data;
      console.log("Token exchange successful:", {
        tokenReceived: !!tokenData.access_token,
        expiresIn: tokenData.expires_in
      });
      
      // Store token temporarily in a cookie for demonstration purposes
      // This isn't a secure way to store tokens, but it works for testing
      cookieStore.set('linkedin_temp_token', tokenData.access_token, {
        path: '/',
        maxAge: 3600, // 1 hour
        httpOnly: true,
        sameSite: 'lax'
      });
      
    } catch (e: any) {
      console.error("Token exchange error:", e.response?.data || e.message);
      return createResponseHtml(false, "Failed to exchange authorization code");
    }
    
    // Return success HTML with token data
    return createResponseHtml(true, undefined, tokenData.access_token);
  } catch (error) {
    console.error("Callback error:", error);
    return createResponseHtml(false, "An unexpected error occurred");
  }
}

function createResponseHtml(success: boolean, errorMessage?: string, token?: string) {
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${success ? 'LinkedIn Connection Successful' : 'Connection Failed'}</title>
      <style>
        body { 
          font-family: system-ui, -apple-system, sans-serif; 
          text-align: center; 
          padding: 2rem;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 80vh;
          margin: 0;
          background-color: #f9fafb;
        }
        .container {
          max-width: 400px;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          background: white;
        }
        .success { color: #16a34a; }
        .error { color: #dc2626; }
        .button {
          display: inline-block;
          margin-top: 1.5rem;
          padding: 0.5rem 1rem;
          background-color: #3b82f6;
          color: white;
          border-radius: 0.25rem;
          text-decoration: none;
          font-weight: 500;
        }
        .token-info {
          margin-top: 1rem;
          padding: 0.5rem;
          background-color: #f3f4f6;
          border-radius: 0.25rem;
          font-size: 0.8rem;
          word-break: break-all;
          text-align: left;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2 class="${success ? 'success' : 'error'}">
          ${success ? '✓ LinkedIn Connection Successful' : '✕ Connection Failed'}
        </h2>
        ${errorMessage ? `<p>${errorMessage}</p>` : ''}
        <p>
          ${success 
            ? 'Your LinkedIn account has been connected successfully.' 
            : 'There was a problem connecting your LinkedIn account.'}
        </p>
        
        ${token ? `
          <div class="token-info">
            <p><strong>Access Token:</strong> ${token.substring(0, 20)}...</p>
            <p>Token received and can be used to access LinkedIn API.</p>
          </div>
        ` : ''}
        
        <a href="/dashboard/linkedin" class="button" id="continue-button">
          Continue to Dashboard
        </a>
      </div>
      
      <script>
        // Send a message to the parent window 
        window.addEventListener('DOMContentLoaded', function() {
          // Check if we're in a popup
          if (window.opener) {
            try {
              console.log("Sending success message to parent window");
              // Send message to parent window
              window.opener.postMessage({
                type: ${success ? '"linkedin_oauth_success"' : '"linkedin_oauth_error"'},
                data: ${success ? '{ token: "' + (token ? token.substring(0, 10) + '...' : '') + '" }' : `{ error: "${errorMessage || 'Unknown error'}" }`}
              }, "*"); // Use * for development
              
              // Add click handler for the continue button
              document.getElementById('continue-button').addEventListener('click', function(e) {
                e.preventDefault();
                window.opener.location.href = '/dashboard/linkedin';
                window.close();
                return false;
              });
            } catch (e) {
              console.error("Error sending message to parent:", e);
            }
          }
        });
      </script>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' },
  });
} 