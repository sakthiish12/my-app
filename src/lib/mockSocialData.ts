// Mock data provider for social media platforms
// This simulates what we would get from actual social API integrations

type SocialPlatform = 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'threads' | 'pinterest';

// Simplified demographic data with regions and engagement metrics
export type SocialDemographicData = {
  totalFollowers: number;
  engagementRate: number;
  regions: Array<{
    name: string;
    percentage: number;
    purchasingPowerIndex?: number;
  }>;
  ageDistribution: Record<string, number>;
  genderDistribution: Record<string, number>;
};

// Mock demographics for testing various scenarios
const mockDemographics: Record<string, SocialDemographicData> = {
  // US-centric, high-income audience
  usHighIncome: {
    totalFollowers: 25000,
    engagementRate: 0.05,
    regions: [
      { name: 'United States', percentage: 65 },
      { name: 'Canada', percentage: 15 },
      { name: 'United Kingdom', percentage: 10 },
      { name: 'European Union', percentage: 5 },
      { name: 'Other', percentage: 5 },
    ],
    ageDistribution: {
      '18-24': 15,
      '25-34': 35,
      '35-44': 30,
      '45-54': 15,
      '55+': 5,
    },
    genderDistribution: {
      'Male': 45,
      'Female': 53,
      'Other': 2,
    },
  },
  
  // Global audience with significant Asian following
  globalWithAsia: {
    totalFollowers: 85000,
    engagementRate: 0.03,
    regions: [
      { name: 'United States', percentage: 25 },
      { name: 'European Union', percentage: 15 },
      { name: 'India', percentage: 20 },
      { name: 'Southeast Asia', percentage: 25 },
      { name: 'Singapore', percentage: 10 },
      { name: 'Other', percentage: 5 },
    ],
    ageDistribution: {
      '18-24': 35,
      '25-34': 40,
      '35-44': 15,
      '45-54': 7,
      '55+': 3,
    },
    genderDistribution: {
      'Male': 65,
      'Female': 33,
      'Other': 2,
    },
  },
  
  // Micro-influencer with highly engaged audience
  microInfluencer: {
    totalFollowers: 8500,
    engagementRate: 0.09,
    regions: [
      { name: 'United States', percentage: 40 },
      { name: 'United Kingdom', percentage: 25 },
      { name: 'Australia', percentage: 15 },
      { name: 'Canada', percentage: 10 },
      { name: 'Other', percentage: 10 },
    ],
    ageDistribution: {
      '18-24': 25,
      '25-34': 45,
      '35-44': 20,
      '45-54': 7,
      '55+': 3,
    },
    genderDistribution: {
      'Male': 25,
      'Female': 73,
      'Other': 2,
    },
  },
  
  // Major influencer with global reach
  majorInfluencer: {
    totalFollowers: 1250000,
    engagementRate: 0.025,
    regions: [
      { name: 'United States', percentage: 30 },
      { name: 'European Union', percentage: 20 },
      { name: 'United Kingdom', percentage: 8 },
      { name: 'Canada', percentage: 7 },
      { name: 'Australia', percentage: 5 },
      { name: 'India', percentage: 10 },
      { name: 'Southeast Asia', percentage: 8 },
      { name: 'South America', percentage: 7 },
      { name: 'Other', percentage: 5 },
    ],
    ageDistribution: {
      '18-24': 30,
      '25-34': 35,
      '35-44': 20,
      '45-54': 10,
      '55+': 5,
    },
    genderDistribution: {
      'Male': 40,
      'Female': 58,
      'Other': 2,
    },
  },
};

// Function to get mock follower data for a given username and platform
export function getMockFollowerData(
  platform: SocialPlatform,
  username: string
): SocialDemographicData {
  // In a real implementation, we would call the appropriate social media API
  // For this prototype, we'll return different mock data based on username length as a simple differentiator
  
  if (username.length < 5) {
    return mockDemographics.microInfluencer;
  } else if (username.length < 8) {
    return mockDemographics.usHighIncome;
  } else if (username.length < 12) {
    return mockDemographics.globalWithAsia;
  } else {
    return mockDemographics.majorInfluencer;
  }
} 