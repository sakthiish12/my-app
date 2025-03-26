export interface Region {
  name: string;
  percentage: number;
  purchasingPowerIndex: number;
}

export interface DemographicData {
  totalFollowers: number;
  regions: Region[];
  engagementRate: number;
}

export interface SocialAccount {
  platform: string;
  username: string;
  followers: number;
  followersData: DemographicData;
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