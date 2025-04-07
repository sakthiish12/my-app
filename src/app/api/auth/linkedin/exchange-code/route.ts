import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import LinkedInAuthService from '@/services/LinkedInAuthService';

export async function POST(request: Request) {
  try {
    // Get authentication info
    const { userId } = auth();
    
    // Get code from request body
    const body = await request.json();
    const { code, redirectUri } = body;
    
    if (!code) {
      return NextResponse.json({ 
        status: 'error', 
        error: 'Authorization code is required' 
      }, { status: 400 });
    }
    
    // Exchange code for access token
    try {
      // Pass the redirect URI that was used in the authorization request
      const tokens = await LinkedInAuthService.getAccessToken(code, redirectUri);
      console.log('Successfully obtained LinkedIn tokens');
      
      // Save tokens to database if user is authenticated
      if (userId) {
        try {
          await LinkedInAuthService.saveTokens(userId, tokens);
          console.log('Successfully saved LinkedIn tokens to database');
        } catch (dbError) {
          console.error('Error saving to database:', dbError);
          // Continue even if saving fails
        }
      } else {
        console.log('No authenticated user, tokens not saved');
      }
      
      // Try to get profile info (optional)
      try {
        const profile = await LinkedInAuthService.getProfile(tokens.accessToken);
        console.log('LinkedIn profile retrieved:', profile.id);
      } catch (profileError) {
        console.error('Error fetching LinkedIn profile:', profileError);
        // Continue anyway, this is not critical
      }
      
      // Return success response
      return NextResponse.json({
        status: 'success',
        message: 'Successfully authenticated with LinkedIn'
      });
    } catch (tokenError) {
      console.error('Error exchanging code for token:', tokenError);
      return NextResponse.json({ 
        status: 'error', 
        error: 'Failed to exchange authorization code for access token' 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('LinkedIn token exchange error:', error);
    return NextResponse.json({ 
      status: 'error', 
      error: 'An unexpected error occurred during authentication' 
    }, { status: 500 });
  }
} 