export type ProductType = 'course' | 'ebook' | 'template' | 'coaching' | 'subscription' | 'software';

export interface Industry {
  name: string;
  percentage: number;
}

export interface Location {
  country: string;
  percentage: number;
}

export interface Engagement {
  likes: number;
  comments: number;
  shares?: number;
}

export interface DemographicData {
  reachPercentage: number;
  industries: Industry[];
  locations: Location[];
  engagement: Engagement;
  seniority?: {
    entry: number;
    mid: number;
    senior: number;
    executive: number;
  };
}

export interface PricingFactors {
  basePrice: number;
  followerMultiplier: number;
  industryMultiplier: number;
  locationMultiplier: number;
  engagementScore: number;
  demographicReach: number;
  followerCount: number;
  topIndustries: Industry[];
  topLocations: Location[];
} 