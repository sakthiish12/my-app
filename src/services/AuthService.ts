import axios from 'axios';

interface OAuthCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

// Configuration for each platform
const PLATFORM_CONFIG = {
  instagram: {
    authUrl: 'https://api.instagram.com/oauth/authorize',
    tokenUrl: 'https://api.instagram.com/oauth/access_token',
    scope: 'user_profile,user_media',
    responseType: 'code',
  },
  facebook: {
    authUrl: 'https://www.facebook.com/v16.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v16.0/oauth/access_token',
    scope: 'public_profile,user_posts,user_location,user_age_range',
    responseType: 'code',
  },
  linkedin: {
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    scope: 'r_liteprofile,r_emailaddress',
    responseType: 'code',
  },
  tiktok: {
    authUrl: 'https://www.tiktok.com/v2/auth/authorize/',
    tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
    scope: 'user.info.basic',
    responseType: 'code',
  },
  pinterest: {
    authUrl: 'https://www.pinterest.com/oauth/',
    tokenUrl: 'https://api.pinterest.com/v5/oauth/token',
    scope: 'user_accounts:read',
    responseType: 'code',
  },
  // Threads uses Instagram authentication
};

export class AuthService {
  /**
   * Generate OAuth authorization URL
   */
  generateAuthUrl(platform: string, credentials: OAuthCredentials): string {
    const config = PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG];
    if (!config) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    const params = new URLSearchParams({
      client_id: credentials.clientId,
      redirect_uri: credentials.redirectUri,
      scope: config.scope,
      response_type: config.responseType,
      state: this.generateState(platform),
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(platform: string, code: string, credentials: OAuthCredentials): Promise<any> {
    const config = PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG];
    if (!config) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    try {
      const response = await axios.post(config.tokenUrl, {
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        code,
        redirect_uri: credentials.redirectUri,
        grant_type: 'authorization_code',
      });

      return response.data;
    } catch (error) {
      console.error(`Error getting ${platform} access token:`, error);
      throw error;
    }
  }

  /**
   * Generate a random state parameter to prevent CSRF
   */
  private generateState(platform: string): string {
    return `${platform}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Validate the state parameter
   */
  validateState(receivedState: string, platform: string): boolean {
    return receivedState.startsWith(`${platform}_`);
  }
}

export default new AuthService(); 