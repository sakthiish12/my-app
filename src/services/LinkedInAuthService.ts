import axios from 'axios';
import { MongoClient } from 'mongodb';
import crypto from 'crypto';

interface LinkedInTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  idToken?: string;
}

class LinkedInAuthService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private localTokenStore: Record<string, LinkedInTokens> = {};
  
  constructor() {
    this.clientId = process.env.LINKEDIN_CLIENT_ID || '';
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET || '';
    
    // Ensure redirect URI is exactly correct, with no trailing slashes or encoding issues
    this.redirectUri = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '') + '/api/auth/linkedin/callback';
    
    if (!this.clientId || !this.clientSecret) {
      console.warn('LinkedIn OAuth credentials not properly configured');
    }
  }
  
  /**
   * Generate a secure random state parameter to prevent CSRF attacks
   */
  generateState(): string {
    return crypto.randomBytes(16).toString('hex');
  }
  
  /**
   * Get the LinkedIn OAuth authorization URL
   */
  getAuthUrl(state: string = this.generateState()): string {
    // Use standard simple encoding method for most reliable results
    return 'https://www.linkedin.com/oauth/v2/authorization?' + 
      `response_type=code&` +
      `client_id=${encodeURIComponent(this.clientId)}&` +
      `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
      `state=${encodeURIComponent(state)}&` +
      `scope=r_liteprofile%20r_emailaddress`;
  }
  
  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code: string, redirectUri?: string): Promise<LinkedInTokens> {
    try {
      // Use provided redirectUri or fall back to the default one
      const finalRedirectUri = redirectUri || this.redirectUri;
      
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', finalRedirectUri);
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      
      console.log('Exchanging code for token with params:', {
        redirectUri: finalRedirectUri,
        clientId: this.clientId,
        clientSecret: this.clientSecret ? '[SECRET HIDDEN]' : 'missing'
      });
      
      const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      console.log('Token response status:', response.status);
      
      // For OpenID Connect, the response includes id_token as well
      const expiresAt = Date.now() + (response.data.expires_in || 3600) * 1000;
      
      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        idToken: response.data.id_token, // OpenID Connect token
        expiresAt
      };
    } catch (error) {
      console.error('Error exchanging LinkedIn auth code for token:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  }
  
  /**
   * Refresh the access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<LinkedInTokens> {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', refreshToken);
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      
      const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const expiresAt = Date.now() + response.data.expires_in * 1000;
      
      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || refreshToken,
        expiresAt
      };
    } catch (error) {
      console.error('Error refreshing LinkedIn access token:', error);
      throw error;
    }
  }
  
  /**
   * Get the user's LinkedIn profile information
   */
  async getProfile(accessToken: string): Promise<any> {
    try {
      const response = await axios.get('https://api.linkedin.com/v2/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching LinkedIn profile:', error);
      throw error;
    }
  }
  
  /**
   * Save LinkedIn OAuth tokens for a user
   */
  async saveTokens(userId: string, tokens: LinkedInTokens): Promise<void> {
    try {
      // Check if we're in development mode without MongoDB
      if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('localhost')) {
        console.log('Development mode: Using mock-tokens API for token storage');
        
        // Use the mock-tokens API instead of MongoDB
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/auth/linkedin/mock-tokens`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, tokens }),
        });
        
        if (!response.ok) {
          throw new Error(`Mock token API error: ${response.status}`);
        }
        
        return;
      }

      // Production mode with MongoDB
      const client = await MongoClient.connect(process.env.MONGODB_URI as string);
      const db = client.db();
      
      await db.collection('integrations').updateOne(
        { userId, platform: 'linkedin' },
        { 
          $set: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: tokens.expiresAt,
            updatedAt: new Date(),
            status: 'connected'
          }
        },
        { upsert: true }
      );
      
      await client.close();
    } catch (error) {
      console.error('Error saving LinkedIn tokens:', error);
      
      // Don't throw in development mode to allow flow to continue
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
      
      console.log('Continuing despite token storage error (development mode)');
    }
  }
  
  /**
   * Get stored LinkedIn tokens for a user
   */
  async getTokens(userId: string): Promise<LinkedInTokens | null> {
    try {
      // Check if we're in development mode without MongoDB
      if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('localhost')) {
        console.log('Development mode: Using mock-tokens API to retrieve tokens');
        
        // Use the mock-tokens API instead of MongoDB
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/auth/linkedin/mock-tokens?userId=${encodeURIComponent(userId)}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            return null; // No tokens found for user
          }
          throw new Error(`Mock token API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.tokens;
      }

      // Production mode with MongoDB
      const client = await MongoClient.connect(process.env.MONGODB_URI as string);
      const db = client.db();
      
      const integration = await db.collection('integrations').findOne(
        { userId, platform: 'linkedin' }
      );
      
      await client.close();
      
      if (!integration) {
        return null;
      }
      
      return {
        accessToken: integration.accessToken,
        refreshToken: integration.refreshToken,
        expiresAt: integration.expiresAt
      };
    } catch (error) {
      console.error('Error getting LinkedIn tokens:', error);
      
      // Don't throw in development mode to allow flow to continue
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
      
      console.log('Returning null despite token retrieval error (development mode)');
      return null;
    }
  }
  
  /**
   * Convert LinkedIn access token to a session cookie for PhantomBuster
   * For development testing, we'll use a placeholder approach
   */
  async getSessionCookieFromToken(accessToken: string): Promise<string> {
    // First check if we have a session cookie directly in environment
    if (process.env.LINKEDIN_SESSION_COOKIE) {
      return process.env.LINKEDIN_SESSION_COOKIE;
    }
    
    // If we have a specific admin access token, use it
    if (process.env.LINKEDIN_ACCESS_TOKEN) {
      console.log('Using admin access token for LinkedIn authentication');
      return this.convertTokenToCookie(process.env.LINKEDIN_ACCESS_TOKEN);
    }
    
    // Otherwise use the provided token
    console.log('Using provided access token for LinkedIn authentication');
    return this.convertTokenToCookie(accessToken);
  }
  
  /**
   * Convert token to cookie (placeholder method)
   */
  private convertTokenToCookie(token: string): string {
    console.log('Note: In production, this would make an actual call to convert the token to a cookie');
    // In a real implementation, this would make an authenticated call to LinkedIn
    // or use a headless browser to extract the cookie after authenticating with the token
    
    // For development, return the token in a format similar to a cookie
    return `li_at=${token}`;
  }
}

export default new LinkedInAuthService(); 