import { ProductType, FollowerDemographics, Region } from '@/types/social';

// Industry average prices based on market research (in USD)
const industryAveragePricing: Record<ProductType, {
  entry: number;
  standard: number;
  premium: number;
  marketData: {
    avgCompletionRate: number;
    avgRefundRate: number;
    avgSatisfactionScore: number;
  }
}> = {
  course: {
    entry: 97,
    standard: 297,
    premium: 997,
    marketData: {
      avgCompletionRate: 0.35,
      avgRefundRate: 0.08,
      avgSatisfactionScore: 4.2
    }
  },
  ebook: {
    entry: 17,
    standard: 37,
    premium: 67,
    marketData: {
      avgCompletionRate: 0.45,
      avgRefundRate: 0.05,
      avgSatisfactionScore: 4.0
    }
  },
  template: {
    entry: 27,
    standard: 67,
    premium: 147,
    marketData: {
      avgCompletionRate: 0.80,
      avgRefundRate: 0.03,
      avgSatisfactionScore: 4.4
    }
  },
  coaching: {
    entry: 97,
    standard: 297,
    premium: 997,
    marketData: {
      avgCompletionRate: 0.75,
      avgRefundRate: 0.04,
      avgSatisfactionScore: 4.6
    }
  },
  planner: {
    entry: 17,
    standard: 37,
    premium: 97,
    marketData: {
      avgCompletionRate: 0.60,
      avgRefundRate: 0.06,
      avgSatisfactionScore: 4.1
    }
  },
  subscription: {
    entry: 9,
    standard: 29,
    premium: 99,
    marketData: {
      avgCompletionRate: 0.70,
      avgRefundRate: 0.12,
      avgSatisfactionScore: 4.0
    }
  },
  software: {
    entry: 29,
    standard: 79,
    premium: 199,
    marketData: {
      avgCompletionRate: 0.65,
      avgRefundRate: 0.07,
      avgSatisfactionScore: 4.3
    }
  },
  digitalArt: {
    entry: 15,
    standard: 47,
    premium: 147,
    marketData: {
      avgCompletionRate: 0.90,
      avgRefundRate: 0.04,
      avgSatisfactionScore: 4.5
    }
  },
  tutorial: {
    entry: 27,
    standard: 67,
    premium: 147,
    marketData: {
      avgCompletionRate: 0.55,
      avgRefundRate: 0.06,
      avgSatisfactionScore: 4.2
    }
  }
};

// Regional economic data (normalized to US = 100)
const regionalEconomicData: Record<string, {
  purchasingPowerIndex: number;
  ecommercePenetration: number;
  digitalProductAdoption: number;
  averageDisposableIncome: number;
  currencyStrength: number;
}> = {
  'United States': {
    purchasingPowerIndex: 100,
    ecommercePenetration: 0.85,
    digitalProductAdoption: 0.80,
    averageDisposableIncome: 45000,
    currencyStrength: 1.00
  },
  'Canada': {
    purchasingPowerIndex: 85,
    ecommercePenetration: 0.83,
    digitalProductAdoption: 0.78,
    averageDisposableIncome: 38000,
    currencyStrength: 0.75
  },
  'United Kingdom': {
    purchasingPowerIndex: 80,
    ecommercePenetration: 0.87,
    digitalProductAdoption: 0.82,
    averageDisposableIncome: 35000,
    currencyStrength: 0.78
  },
  'European Union': {
    purchasingPowerIndex: 75,
    ecommercePenetration: 0.80,
    digitalProductAdoption: 0.75,
    averageDisposableIncome: 32000,
    currencyStrength: 0.85
  },
  'Australia': {
    purchasingPowerIndex: 85,
    ecommercePenetration: 0.82,
    digitalProductAdoption: 0.77,
    averageDisposableIncome: 37000,
    currencyStrength: 0.70
  },
  'Japan': {
    purchasingPowerIndex: 70,
    ecommercePenetration: 0.89,
    digitalProductAdoption: 0.85,
    averageDisposableIncome: 30000,
    currencyStrength: 0.90
  },
  'South Korea': {
    purchasingPowerIndex: 65,
    ecommercePenetration: 0.90,
    digitalProductAdoption: 0.88,
    averageDisposableIncome: 28000,
    currencyStrength: 0.85
  },
  'China': {
    purchasingPowerIndex: 40,
    ecommercePenetration: 0.85,
    digitalProductAdoption: 0.80,
    averageDisposableIncome: 15000,
    currencyStrength: 0.15
  },
  'India': {
    purchasingPowerIndex: 25,
    ecommercePenetration: 0.70,
    digitalProductAdoption: 0.65,
    averageDisposableIncome: 8000,
    currencyStrength: 0.012
  },
  'Brazil': {
    purchasingPowerIndex: 35,
    ecommercePenetration: 0.65,
    digitalProductAdoption: 0.60,
    averageDisposableIncome: 12000,
    currencyStrength: 0.20
  },
  'Other': {
    purchasingPowerIndex: 50,
    ecommercePenetration: 0.70,
    digitalProductAdoption: 0.65,
    averageDisposableIncome: 20000,
    currencyStrength: 0.50
  }
};

// Engagement metrics impact on pricing
const getEngagementMultiplier = (
  engagementRate: number,
  followerCount: number
): number => {
  // Base multiplier from engagement rate
  let multiplier = 1.0;
  
  // Engagement rate impact
  if (engagementRate < 0.01) multiplier *= 0.85;
  else if (engagementRate < 0.03) multiplier *= 0.95;
  else if (engagementRate < 0.05) multiplier *= 1.0;
  else if (engagementRate < 0.08) multiplier *= 1.1;
  else if (engagementRate < 0.12) multiplier *= 1.2;
  else multiplier *= 1.3;

  // Adjust based on follower count (larger audiences typically have lower engagement)
  const normalizedEngagement = engagementRate * Math.log10(followerCount);
  if (normalizedEngagement > 0.5) multiplier *= 1.15;
  
  return multiplier;
};

// Calculate market position based on audience quality
const calculateMarketPosition = (
  demographics: FollowerDemographics,
  productType: ProductType
): 'entry' | 'standard' | 'premium' => {
  const {
    totalFollowers,
    engagementRate,
    regions
  } = demographics;

  // Calculate audience quality score (0-100)
  let qualityScore = 0;

  // Engagement contribution (0-40 points)
  qualityScore += (engagementRate * 1000) * 40;

  // Follower count contribution (0-30 points)
  const followerScore = Math.min(Math.log10(totalFollowers) * 10, 30);
  qualityScore += followerScore;

  // Regional quality contribution (0-30 points)
  const weightedRegionalScore = regions.reduce((score, region) => {
    const regionData = regionalEconomicData[region.name] || regionalEconomicData['Other'];
    return score + (
      (regionData.purchasingPowerIndex / 100) * 
      regionData.digitalProductAdoption * 
      (region.percentage / 100) * 
      30
    );
  }, 0);
  qualityScore += weightedRegionalScore;

  // Determine market position based on quality score
  if (qualityScore >= 75) return 'premium';
  if (qualityScore >= 45) return 'standard';
  return 'entry';
};

// Calculate weighted purchasing power and market factors
const calculateMarketFactors = (
  regions: Region[],
  productType: ProductType
): number => {
  let marketMultiplier = 0;
  const totalWeight = regions.reduce((sum, region) => sum + region.percentage, 0);

  for (const region of regions) {
    const normalizedWeight = region.percentage / totalWeight;
    const regionData = regionalEconomicData[region.name] || regionalEconomicData['Other'];
    
    const regionMultiplier = (
      (regionData.purchasingPowerIndex / 100) *
      regionData.ecommercePenetration *
      regionData.digitalProductAdoption *
      (regionData.averageDisposableIncome / regionalEconomicData['United States'].averageDisposableIncome)
    );

    marketMultiplier += regionMultiplier * normalizedWeight;
  }

  // Adjust for product type market conditions
  const productMarketData = industryAveragePricing[productType].marketData;
  marketMultiplier *= (
    (1 + productMarketData.avgSatisfactionScore / 5) *
    (1 - productMarketData.avgRefundRate) *
    (1 + productMarketData.avgCompletionRate)
  );

  return marketMultiplier;
};

export function analyzeAndRecommendPrice(
  productType: ProductType,
  demographics: FollowerDemographics
): {
  recommendedPrice: number;
  priceRange: { min: number; max: number };
  conversionRatePrediction: number;
  marketPosition: 'entry' | 'standard' | 'premium';
  confidenceScore: number;
} {
  // Determine market position
  const marketPosition = calculateMarketPosition(demographics, productType);
  
  // Get base price for the determined market position
  const basePrice = industryAveragePricing[productType][marketPosition];
  
  // Calculate engagement multiplier
  const engagementMultiplier = getEngagementMultiplier(
    demographics.engagementRate,
    demographics.totalFollowers
  );
  
  // Calculate market factors
  const marketFactors = calculateMarketFactors(demographics.regions, productType);
  
  // Calculate recommended price
  let recommendedPrice = basePrice * engagementMultiplier * marketFactors;
  
  // Round to appropriate price point
  if (recommendedPrice > 100) {
    recommendedPrice = Math.round(recommendedPrice / 10) * 10 - 3;
  } else {
    recommendedPrice = Math.round(recommendedPrice) - 1;
  }
  
  // Calculate price range
  const priceRange = {
    min: Math.max(
      industryAveragePricing[productType].entry,
      Math.floor(recommendedPrice * 0.8)
    ),
    max: Math.min(
      industryAveragePricing[productType].premium,
      Math.ceil(recommendedPrice * 1.3)
    )
  };
  
  // Predict conversion rate
  const marketData = industryAveragePricing[productType].marketData;
  let conversionRatePrediction = 0.05; // Base conversion rate
  
  // Adjust conversion rate based on price position
  const pricePositionFactor = recommendedPrice / basePrice;
  if (pricePositionFactor < 0.8) conversionRatePrediction *= 1.2;
  else if (pricePositionFactor > 1.2) conversionRatePrediction *= 0.8;
  
  // Adjust for market factors
  conversionRatePrediction *= (
    (1 - marketData.avgRefundRate) *
    marketData.avgCompletionRate *
    (marketData.avgSatisfactionScore / 5)
  );
  
  // Calculate confidence score (0-100)
  const confidenceScore = Math.min(Math.round(
    (engagementMultiplier * 30) +
    (marketFactors * 40) +
    ((1 - Math.abs(1 - pricePositionFactor)) * 30)
  ), 100);

  return {
    recommendedPrice,
    priceRange,
    conversionRatePrediction,
    marketPosition,
    confidenceScore
  };
} 