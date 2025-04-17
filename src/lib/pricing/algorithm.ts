import { PricingFactors, ProductType, DemographicData } from '@/types/pricing';

interface PricingResult {
  recommendedPrice: number;
  minPrice: number;
  maxPrice: number;
  confidence: number;
  factors: PricingFactors;
}

const INDUSTRY_MULTIPLIERS: Record<string, number> = {
  'technology': 1.2,
  'finance': 1.3,
  'healthcare': 1.15,
  'education': 0.9,
  'retail': 0.85,
  // Add more industries as needed
};

const LOCATION_MULTIPLIERS: Record<string, number> = {
  'United States': 1.0,
  'Canada': 0.95,
  'United Kingdom': 0.9,
  'Australia': 0.85,
  // Add more countries as needed
};

const BASE_PRICES: Record<ProductType, number> = {
  'course': 199,
  'ebook': 29,
  'template': 49,
  'coaching': 299,
  'subscription': 19,
  'software': 99,
};

export function calculatePrice(
  productType: ProductType,
  demographics: DemographicData,
  followerCount: number
): PricingResult {
  // Base price for the product type
  const basePrice = BASE_PRICES[productType];
  
  // Calculate follower count multiplier (logarithmic scale)
  const followerMultiplier = 1 + (Math.log10(Math.max(followerCount, 100)) - 2) * 0.2;
  
  // Calculate industry multiplier (weighted average if multiple industries)
  const industryMultiplier = demographics.industries.reduce((acc, industry) => {
    return acc + (INDUSTRY_MULTIPLIERS[industry.name] || 1) * (industry.percentage / 100);
  }, 0);
  
  // Calculate location multiplier (weighted average)
  const locationMultiplier = demographics.locations.reduce((acc, location) => {
    return acc + (LOCATION_MULTIPLIERS[location.country] || 0.7) * (location.percentage / 100);
  }, 0);
  
  // Calculate engagement score (0-1)
  const engagementScore = Math.min(
    (demographics.engagement.likes + demographics.engagement.comments * 3) / followerCount,
    1
  );
  
  // Calculate recommended price
  const recommendedPrice = basePrice * 
    followerMultiplier * 
    industryMultiplier * 
    locationMultiplier * 
    (1 + engagementScore * 0.3);
  
  // Calculate price range (±20% from recommended)
  const minPrice = recommendedPrice * 0.8;
  const maxPrice = recommendedPrice * 1.2;
  
  // Calculate confidence score (0-1)
  const confidence = calculateConfidence(demographics, followerCount);
  
  // Record all factors used in calculation
  const factors: PricingFactors = {
    basePrice,
    followerMultiplier,
    industryMultiplier,
    locationMultiplier,
    engagementScore,
    demographicReach: demographics.reachPercentage,
    followerCount,
    topIndustries: demographics.industries.slice(0, 3),
    topLocations: demographics.locations.slice(0, 3),
  };
  
  return {
    recommendedPrice: Math.round(recommendedPrice),
    minPrice: Math.round(minPrice),
    maxPrice: Math.round(maxPrice),
    confidence,
    factors,
  };
}

function calculateConfidence(demographics: DemographicData, followerCount: number): number {
  const factors = [
    // Data completeness
    demographics.reachPercentage / 100,
    // Follower count significance
    Math.min(followerCount / 10000, 1),
    // Engagement quality
    Math.min((demographics.engagement.likes + demographics.engagement.comments) / followerCount * 100, 1),
    // Geographic diversity
    Math.min(demographics.locations.length / 10, 1),
    // Industry diversity
    Math.min(demographics.industries.length / 5, 1),
  ];
  
  return factors.reduce((acc, factor) => acc + factor, 0) / factors.length;
} 