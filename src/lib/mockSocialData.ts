// Mock data provider for social media platforms
// This simulates what we would get from actual social API integrations

import { DemographicData, Region } from '@/types/social';

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
const mockDemographics: Record<string, DemographicData> = {
  // US-centric, high-income audience
  usHighIncome: {
    totalFollowers: 25000,
    engagementRate: 0.05,
    regions: [
      { name: 'United States', percentage: 65, purchasingPowerIndex: 100 },
      { name: 'Canada', percentage: 15, purchasingPowerIndex: 95 },
      { name: 'United Kingdom', percentage: 10, purchasingPowerIndex: 90 },
      { name: 'European Union', percentage: 5, purchasingPowerIndex: 85 },
      { name: 'Other', percentage: 5, purchasingPowerIndex: 70 },
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
      { name: 'United States', percentage: 25, purchasingPowerIndex: 100 },
      { name: 'European Union', percentage: 15, purchasingPowerIndex: 85 },
      { name: 'India', percentage: 20, purchasingPowerIndex: 60 },
      { name: 'Southeast Asia', percentage: 25, purchasingPowerIndex: 65 },
      { name: 'Singapore', percentage: 10, purchasingPowerIndex: 95 },
      { name: 'Other', percentage: 5, purchasingPowerIndex: 70 },
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
      { name: 'United States', percentage: 40, purchasingPowerIndex: 100 },
      { name: 'United Kingdom', percentage: 25, purchasingPowerIndex: 90 },
      { name: 'Australia', percentage: 15, purchasingPowerIndex: 95 },
      { name: 'Canada', percentage: 10, purchasingPowerIndex: 95 },
      { name: 'Other', percentage: 10, purchasingPowerIndex: 70 },
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
      { name: 'United States', percentage: 30, purchasingPowerIndex: 100 },
      { name: 'European Union', percentage: 20, purchasingPowerIndex: 85 },
      { name: 'United Kingdom', percentage: 8, purchasingPowerIndex: 90 },
      { name: 'Canada', percentage: 7, purchasingPowerIndex: 95 },
      { name: 'Australia', percentage: 5, purchasingPowerIndex: 95 },
      { name: 'India', percentage: 10, purchasingPowerIndex: 60 },
      { name: 'Southeast Asia', percentage: 8, purchasingPowerIndex: 65 },
      { name: 'South America', percentage: 7, purchasingPowerIndex: 75 },
      { name: 'Other', percentage: 5, purchasingPowerIndex: 70 },
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
): DemographicData {
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