type Region = {
  name: string;
  percentage: number;
  purchasingPowerIndex: number;
};

type FollowerDemographics = {
  totalFollowers: number;
  regions: Region[];
  ageDistribution?: {
    [key: string]: number;
  };
  genderDistribution?: {
    [key: string]: number;
  };
  engagementRate?: number;
};

type ProductType = 
  | 'course' 
  | 'ebook' 
  | 'template' 
  | 'coaching' 
  | 'planner' 
  | 'subscription' 
  | 'software' 
  | 'digitalArt' 
  | 'tutorial';

// Base pricing matrix per product type (in USD)
const baseProductPricing: Record<ProductType, { base: number, range: [number, number] }> = {
  course: { base: 97, range: [47, 497] },
  ebook: { base: 27, range: [9, 47] },
  template: { base: 37, range: [17, 97] },
  coaching: { base: 150, range: [50, 500] },
  planner: { base: 17, range: [7, 37] },
  subscription: { base: 15, range: [5, 50] },
  software: { base: 49, range: [19, 199] },
  digitalArt: { base: 25, range: [5, 100] },
  tutorial: { base: 37, range: [17, 97] },
};

// Purchasing power index by region (simplified, normalized where US = 100)
const regionPurchasingPower: Record<string, number> = {
  'United States': 100,
  'Canada': 85,
  'United Kingdom': 80,
  'European Union': 75,
  'Australia': 85,
  'Japan': 70,
  'South Korea': 65,
  'China': 40,
  'India': 25,
  'Brazil': 35,
  'Mexico': 30,
  'Singapore': 90,
  'Southeast Asia': 30,
  'Middle East': 70,
  'Africa': 20,
  'Russia': 40,
  'Other': 50,
};

// Follower count multiplier - larger audiences often mean lower prices to maximize conversion
const getFollowerCountMultiplier = (followerCount: number): number => {
  if (followerCount < 1000) return 0.8; // Very small audience, might need to charge more
  if (followerCount < 10000) return 0.9; // Small audience
  if (followerCount < 50000) return 1.0; // Medium audience
  if (followerCount < 100000) return 1.05; // Large audience, slight optimization for volume
  if (followerCount < 500000) return 1.1; // Very large audience
  return 1.15; // Mega influencer, optimize for volume
};

// Engagement rate multiplier - higher engagement means audience values your content more
const getEngagementMultiplier = (engagementRate: number): number => {
  if (engagementRate < 0.01) return 0.85; // Very low engagement
  if (engagementRate < 0.03) return 0.95; // Below average engagement
  if (engagementRate < 0.05) return 1.0; // Average engagement
  if (engagementRate < 0.08) return 1.1; // Good engagement
  if (engagementRate < 0.12) return 1.2; // Very good engagement
  return 1.3; // Exceptional engagement
};

// Calculate weighted purchasing power based on follower demographics
const calculateWeightedPurchasingPower = (regions: Region[]): number => {
  let weightedPurchasingPower = 0;
  
  for (const region of regions) {
    const purchasingPower = region.purchasingPowerIndex || 
                           regionPurchasingPower[region.name] || 
                           regionPurchasingPower['Other'];
    
    weightedPurchasingPower += (purchasingPower * (region.percentage / 100));
  }
  
  // Normalize to a value around 1.0
  return weightedPurchasingPower / 100;
};

export function analyzeAndRecommendPrice(
  productType: ProductType,
  demographics: FollowerDemographics
): {
  recommendedPrice: number;
  priceRange: { min: number; max: number };
  conversionRatePrediction: number;
} {
  // Get the base pricing for this product type
  const { base, range } = baseProductPricing[productType];
  
  // Calculate weighted purchasing power multiplier based on regions
  const purchasingPowerMultiplier = calculateWeightedPurchasingPower(demographics.regions);
  
  // Calculate follower count multiplier
  const followerMultiplier = getFollowerCountMultiplier(demographics.totalFollowers);
  
  // Calculate engagement multiplier (default to 1.0 if not provided)
  const engagementMultiplier = demographics.engagementRate 
    ? getEngagementMultiplier(demographics.engagementRate)
    : 1.0;
  
  // Calculate the recommended price
  let recommendedPrice = base * purchasingPowerMultiplier * followerMultiplier * engagementMultiplier;
  
  // Round to nearest .99 or .97 price point
  recommendedPrice = Math.round(recommendedPrice);
  if (recommendedPrice > 10) {
    recommendedPrice = recommendedPrice - (recommendedPrice % 10) + 7;
  } else {
    recommendedPrice = recommendedPrice - 0.01;
  }
  
  // Calculate a reasonable price range
  const minPrice = Math.max(range[0], Math.floor(recommendedPrice * 0.7));
  const maxPrice = Math.min(range[1], Math.ceil(recommendedPrice * 1.5));
  
  // Estimate conversion rate (simplified model)
  // Higher prices typically result in lower conversion rates
  const basePriceRatio = recommendedPrice / base;
  let conversionRatePrediction = 0.05; // Default 5% conversion
  
  if (basePriceRatio < 0.7) {
    conversionRatePrediction = 0.08; // 8% when priced lower than standard
  } else if (basePriceRatio > 1.3) {
    conversionRatePrediction = 0.03; // 3% when priced higher than standard
  }
  
  // Adjust by engagement (engaged followers more likely to convert)
  conversionRatePrediction *= engagementMultiplier;
  
  return {
    recommendedPrice,
    priceRange: { min: minPrice, max: maxPrice },
    conversionRatePrediction,
  };
} 