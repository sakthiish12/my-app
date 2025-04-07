import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import LinkedInAuthService from '@/services/LinkedInAuthService';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Generate a unique state to prevent CSRF attacks
    const state = LinkedInAuthService.generateState();
    
    // Store the state in a cookie to verify on callback
    const cookieStore = cookies();
    
    // Clear any existing OAuth state cookie first
    cookieStore.delete('linkedin_oauth_state');
    
    // Set the new cookie
    cookieStore.set('linkedin_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60, // 1 hour
      path: '/',
      sameSite: 'lax'
    });
    
    // Get authorization URL with state
    const authUrl = LinkedInAuthService.getAuthUrl(state);
    
    // Log the URL we're redirecting to (for debugging)
    console.log('Redirecting to LinkedIn OAuth URL:', authUrl);
    
    // Redirect to LinkedIn for authorization
    return NextResponse.redirect(authUrl);
    
  } catch (error) {
    console.error('LinkedIn authentication error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/linkedin?error=auth_init_failed', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000')
    );
  }
} 