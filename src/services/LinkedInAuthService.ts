import axios from 'axios';
import { MongoClient } from 'mongodb';
import crypto from 'crypto';

interface LinkedInTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
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
      
      const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      const expiresAt = Date.now() + response.data.expires_in * 1000;
      
      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt
      };
    } catch (error) {
      console.error('Error exchanging LinkedIn auth code for token:', error);
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
    if (process.env.LINKEDIN_SESSION_COOKIE) {
      // Use the environment variable if available as a fallback
      return process.env.LINKEDIN_SESSION_COOKIE;
    }
    
    console.warn("Using development placeholder for LinkedIn cookie extraction.");
    
    // In a production environment, you would implement a service to:
    // 1. Use a headless browser like Puppeteer to login to LinkedIn with the token
    // 2. Extract and return the actual session cookies
    
    // For now, return a placeholder to allow development
    return "placeholder_session_cookie_for_dev";
  }
}

export default new LinkedInAuthService(); 