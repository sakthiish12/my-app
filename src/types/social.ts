export interface SocialAccount {
  platform: string;
  username: string;
  followers: number;
  followersData: {
    totalFollowers: number;
    regions: Record<string, number>;
    engagementRate: number;
  };
  lastUpdated: Date;
}

export interface User {
  clerkId: string;
  email: string;
  name: string;
  socialAccounts: SocialAccount[];
}

export interface PricingRecommendation {
  recommendedPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  conversionRatePrediction: number;
} 