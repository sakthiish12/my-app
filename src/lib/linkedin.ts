import axios from 'axios';
import { cookies } from 'next/headers';

/**
 * LinkedIn API utility functions
 */

// Export LinkedIn OAuth configuration constants
export const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || '';
export const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET || '';

// Construct the LinkedIn redirect URI based on environment
const origin = process.env.NODE_ENV === 'production' 
  ? 'https://socioprice.com' 
  : 'http://localhost:3000';
export const LINKEDIN_REDIRECT_URI = `${origin}/api/auth/callback/linkedin`;

/**
 * Interface for LinkedIn Profile data
 */
export interface LinkedInProfile {
  id: string;
  localizedFirstName?: string;
  localizedLastName?: string;
  profilePicture?: string;
  email?: string;
  headline?: string;
  vanityName?: string;
}

/**
 * Gets the LinkedIn access token from cookies
 */
export function getLinkedInToken(): string | null {
  return cookies().get('linkedin_access_token')?.value || null;
}

/**
 * Sets the LinkedIn access token in cookies
 */
export function setLinkedInToken(token: string, expiresIn: number = 3600): void {
  cookies().set('linkedin_access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: expiresIn,
    path: '/',
  });
}

/**
 * Check if the LinkedIn token is valid
 */
export async function verifyLinkedInToken(token: string): Promise<boolean> {
  try {
    await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get complete LinkedIn profile data
 */
export async function getLinkedInProfile(token: string): Promise<LinkedInProfile> {
  const profile: LinkedInProfile = { id: '' };

  try {
    // Get basic profile
    const basicProfileResponse = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    const basicData = basicProfileResponse.data;
    profile.id = basicData.id;
    profile.localizedFirstName = basicData.localizedFirstName;
    profile.localizedLastName = basicData.localizedLastName;
    profile.vanityName = basicData.vanityName;
    
    // Try to get email
    try {
      const emailResponse = await axios.get(
        'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (emailResponse.data?.elements?.[0]?.['handle~']?.emailAddress) {
        profile.email = emailResponse.data.elements[0]['handle~'].emailAddress;
      }
    } catch (emailError) {
      console.error('LinkedIn email fetch error:', emailError);
    }
    
    // Try to get profile picture
    try {
      const pictureResponse = await axios.get(
        'https://api.linkedin.com/v2/me?projection=(id,profilePicture(displayImage~:playableStreams))', 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      const pictureData = pictureResponse.data?.profilePicture?.['displayImage~']?.elements;
      if (pictureData && pictureData.length > 0) {
        // Get the highest quality image
        const sortedImages = [...pictureData].sort((a, b) => 
          (b.width * b.height) - (a.width * a.height)
        );
        profile.profilePicture = sortedImages[0]?.identifiers?.[0]?.identifier;
      }
    } catch (pictureError) {
      console.error('LinkedIn picture fetch error:', pictureError);
    }
    
    return profile;
  } catch (error) {
    console.error('LinkedIn profile fetch error:', error);
    throw new Error('Failed to fetch LinkedIn profile');
  }
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  try {
    const response = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID || '',
        client_secret: process.env.LINKEDIN_CLIENT_SECRET || '',
        redirect_uri: redirectUri,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('LinkedIn token exchange error:', error);
    throw new Error('Failed to exchange code for LinkedIn access token');
  }
}

/**
 * Generate LinkedIn OAuth URL
 */
export function getLinkedInAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.LINKEDIN_CLIENT_ID || '',
    redirect_uri: redirectUri,
    state,
    scope: 'r_liteprofile r_emailaddress',
  });
  
  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

/**
 * Utility for using LinkedIn data in your game
 * This updates the user's game profile with LinkedIn data
 */
export async function updateGameProfileWithLinkedIn(
  userId: string, 
  linkedinProfile: LinkedInProfile
): Promise<boolean> {
  try {
    // This is where you'd integrate with your game's database
    // Example implementation:
    /*
    await db.collection('users').updateOne(
      { id: userId },
      { 
        $set: {
          'linkedin.id': linkedinProfile.id,
          'linkedin.firstName': linkedinProfile.localizedFirstName,
          'linkedin.lastName': linkedinProfile.localizedLastName,
          'linkedin.profilePicture': linkedinProfile.profilePicture,
          'linkedin.email': linkedinProfile.email,
          'linkedin.lastUpdated': new Date()
        }
      }
    );
    */
    
    // For now, just log what would happen
    console.log('Would update game profile for user', userId, 'with LinkedIn data:', linkedinProfile);
    
    return true;
  } catch (error) {
    console.error('Error updating game profile with LinkedIn data:', error);
    return false;
  }
} 