import axios from 'axios';
import { DemographicData } from '@/types/social';

export interface InstagramCredentials {
  appId: string;
  appSecret: string;
  accessToken?: string;
}

export class InstagramService {
  private baseUrl = 'https://graph.instagram.com/v12.0';
  private credentials: InstagramCredentials;

  constructor(credentials: InstagramCredentials) {
    this.credentials = credentials;
  }

  async getAccessToken(code: string): Promise<string> {
    const response = await axios.get('https://api.instagram.com/oauth/access_token', {
      params: {
        client_id: this.credentials.appId,
        client_secret: this.credentials.appSecret,
        grant_type: 'authorization_code',
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
        code,
      },
    });
    return response.data.access_token;
  }

  async getUserProfile(accessToken: string) {
    const response = await axios.get(`${this.baseUrl}/me`, {
      params: {
        fields: 'id,username,account_type,media_count,followers_count',
        access_token: accessToken,
      },
    });
    return response.data;
  }

  async getMediaInsights(mediaId: string, accessToken: string) {
    const response = await axios.get(`${this.baseUrl}/${mediaId}/insights`, {
      params: {
        metric: 'engagement,impressions,reach,saved',
        access_token: accessToken,
      },
    });
    return response.data;
  }

  async getAudienceInsights(accessToken: string) {
    const response = await axios.get(`${this.baseUrl}/me/insights`, {
      params: {
        metric: 'audience_gender_age,audience_locale,audience_country',
        period: 'lifetime',
        access_token: accessToken,
      },
    });
    return response.data;
  }

  async getFullDemographicData(accessToken: string): Promise<DemographicData> {
    const [profile, audience] = await Promise.all([
      this.getUserProfile(accessToken),
      this.getAudienceInsights(accessToken),
    ]);

    // Process audience data into regions
    const regions = audience.data.find((d: any) => d.name === 'audience_country')
      .values[0].value;

    // Process age and gender distribution
    const ageGender = audience.data.find((d: any) => d.name === 'audience_gender_age')
      .values[0].value;

    // Calculate engagement rate from recent posts
    const posts = await this.getRecentPosts(accessToken);
    const engagementRate = this.calculateEngagementRate(posts);

    return {
      totalFollowers: profile.followers_count,
      engagementRate,
      regions: Object.entries(regions).map(([name, percentage]: [string, any]) => ({
        name,
        percentage: percentage * 100,
      })),
      ageDistribution: this.processAgeDistribution(ageGender),
      genderDistribution: this.processGenderDistribution(ageGender),
    };
  }

  private async getRecentPosts(accessToken: string) {
    const response = await axios.get(`${this.baseUrl}/me/media`, {
      params: {
        fields: 'id,like_count,comments_count',
        limit: 25,
        access_token: accessToken,
      },
    });
    return response.data.data;
  }

  private calculateEngagementRate(posts: any[]): number {
    if (posts.length === 0) return 0;

    const totalEngagement = posts.reduce((sum: number, post: any) => {
      return sum + (post.like_count || 0) + (post.comments_count || 0);
    }, 0);

    return totalEngagement / (posts.length * this.totalFollowers);
  }

  private processAgeDistribution(ageGender: any): Record<string, number> {
    const distribution: Record<string, number> = {};
    Object.entries(ageGender).forEach(([key, value]: [string, any]) => {
      const age = key.split('.')[1];
      if (!distribution[age]) distribution[age] = 0;
      distribution[age] += value;
    });
    return distribution;
  }

  private processGenderDistribution(ageGender: any): Record<string, number> {
    const distribution: Record<string, number> = {
      'Male': 0,
      'Female': 0,
      'Other': 0,
    };
    
    Object.entries(ageGender).forEach(([key, value]: [string, any]) => {
      const gender = key.split('.')[0];
      distribution[gender] += value;
    });
    
    return distribution;
  }
} 