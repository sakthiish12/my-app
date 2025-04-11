import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

const LINKEDIN_CLIENT_ID = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/linkedin/callback`;
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const STATE_COOKIE_NAME = 'linkedin_oauth_state';

// Function to generate the HTML response for the popup
function generatePopupResponse(success: boolean, data: any) {
  const message = JSON.stringify({ 
    type: success ? 'linkedin_oauth_success' : 'linkedin_oauth_error',
    data: success ? data : { error: data?.message || 'Unknown error during token exchange' }, 
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>LinkedIn Auth Callback</title>
    </head>
    <body>
      <p>Processing...</p>
      <script>
        try {
          // Send message back to the main window
          if (window.opener && window.opener.location.origin === window.location.origin) {
            window.opener.postMessage(${message}, window.location.origin);
            console.log('Sent message to opener:', ${message});
          } else {
            console.warn('Could not find window.opener or origin mismatch.');
          }
        } catch (e) {
          console.error('Error sending message to opener:', e);
        }
        // Close the popup
        window.close();
      </script>
    </body>
    </html>
  `;
}

export async function GET(request: NextRequest) {
  console.log('LinkedIn callback initiated.');
  const cookieStore = cookies();
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  // State Validation
  const storedState = cookieStore.get(STATE_COOKIE_NAME)?.value;
  console.log('State received:', state, 'Stored state:', storedState);

  if (storedState) {
    cookieStore.delete(STATE_COOKIE_NAME);
  }

  if (!state || !storedState || state !== storedState) {
    console.error('Invalid state parameter.', { received: state, expected: storedState });
    return new NextResponse(generatePopupResponse(false, { message: 'Invalid state parameter. Please try connecting again.' }), { 
      status: 400, 
      headers: { 'Content-Type': 'text/html' } 
    });
  }

  if (!code) {
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');
    console.error('LinkedIn OAuth Error:', error, errorDescription);
    return new NextResponse(generatePopupResponse(false, { message: errorDescription || error || 'Authorization code missing' }), { 
        status: 400, 
        headers: { 'Content-Type': 'text/html' } 
    });
  }

  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET || !REDIRECT_URI) {
    console.error('Missing LinkedIn OAuth environment variables');
    return new NextResponse(generatePopupResponse(false, { message: 'Server configuration error' }), { 
        status: 500, 
        headers: { 'Content-Type': 'text/html' } 
    });
  }

  const { userId } = auth();
  console.log('Authenticated userId:', userId);
  if (!userId) {
     console.error('User not authenticated during LinkedIn callback.');
     return new NextResponse(generatePopupResponse(false, { message: 'User authentication required.' }), { 
         status: 401, 
         headers: { 'Content-Type': 'text/html' } 
     });
  }

  try {
    console.log('Exchanging code for token...');
    const response = await axios.post(
      LINKEDIN_TOKEN_URL,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, expires_in } = response.data;
    console.log('Token received:', access_token);

    try {
       await connectToDatabase();
       const updateResult = await User.findOneAndUpdate(
         { clerkId: userId }, 
         { 
           $set: { 
             'linkedin.accessToken': access_token, 
             'linkedin.expiresIn': expires_in, 
             'linkedin.lastUpdated': new Date() 
           }
         },
         { new: true, upsert: false }
       );

       if (!updateResult) {
          console.warn(`User with clerkId ${userId} not found in DB during token storage.`);
       }
       console.log(`Stored/Updated LinkedIn token for user ${userId}`);

    } catch (dbError) {
       console.error(`Database error storing LinkedIn token for user ${userId}:`, dbError);
    }

    return new NextResponse(generatePopupResponse(true, { message: 'Successfully connected LinkedIn' }), { 
        status: 200, 
        headers: { 'Content-Type': 'text/html' } 
    });

  } catch (error: any) {
    console.error('Error exchanging LinkedIn code for token:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.error_description || error.response?.data?.error || error.message || 'Failed to exchange code for token';
    return new NextResponse(generatePopupResponse(false, { message: errorMessage }), { 
        status: 500, 
        headers: { 'Content-Type': 'text/html' } 
    });
  }
} 