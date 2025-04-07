import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import PricingRecommendationModel from '@/models/PricingRecommendation';

/**
 * Generate pricing recommendations based on follower demographics
 */
export async function POST(request: Request) {
  try {
    // Get user ID from Clerk authentication
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { 
      productName, 
      productDescription, 
      productType, 
      productCost, 
      targetMargin, 
      platforms 
    } = body;

    // Validate required fields
    if (!productName || !productDescription || !productType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Connect to database
    const dbConnection = await connectToDatabase();
    if (!dbConnection) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Find user and get their social accounts data
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Filter for the requested platforms
    const relevantAccounts = user.socialAccounts.filter((account: any) => 
      platforms.includes(account.platform) && account.followersData
    );

    if (relevantAccounts.length === 0) {
      return NextResponse.json({ 
        error: 'No connected social accounts with follower data found for the selected platforms' 
      }, { status: 400 });
    }

    // Aggregate demographic data for analysis
    const aggregatedDemographics = aggregateDemographics(relevantAccounts);

    // Generate pricing recommendations based on demographic data
    const pricingRecommendations = generatePricingRecommendations(
      aggregatedDemographics,
      productType,
      productCost,
      targetMargin
    );

    // Save recommendations to database
    const newRecommendation = new PricingRecommendationModel({
      userId,
      productName,
      productDescription,
      productType,
      productCost,
      targetMargin,
      platforms,
      segments: pricingRecommendations.segments
    });

    await newRecommendation.save();

    // Return generated recommendations
    return NextResponse.json({ recommendations: pricingRecommendations });
  } catch (error) {
    console.error('Error generating pricing recommendations:', error);
    return NextResponse.json({ error: 'Failed to generate pricing recommendations' }, { status: 500 });
  }
}

/**
 * Aggregate demographic data from multiple social accounts
 */
function aggregateDemographics(accounts: any[]) {
  // Initialize aggregated data
  const aggregated = {
    totalFollowers: 0,
    ageDistribution: {} as Record<string, number>,
    genderDistribution: {} as Record<string, number>,
    locationDistribution: {} as Record<string, number>,
    interestCategories: {} as Record<string, number>,
    incomeRanges: {} as Record<string, number>
  };

  // Aggregate data from all accounts
  accounts.forEach(account => {
    // Add total followers
    aggregated.totalFollowers += account.followersData?.totalFollowers || 0;
    
    // Aggregate age distribution
    if (account.followersData?.ageDistribution) {
      Object.entries(account.followersData.ageDistribution).forEach(([age, value]) => {
        aggregated.ageDistribution[age] = (aggregated.ageDistribution[age] || 0) + (value as number);
      });
    }
    
    // Aggregate gender distribution
    if (account.followersData?.genderDistribution) {
      Object.entries(account.followersData.genderDistribution).forEach(([gender, value]) => {
        aggregated.genderDistribution[gender] = (aggregated.genderDistribution[gender] || 0) + (value as number);
      });
    }
    
    // Aggregate location distribution
    if (account.followersData?.locationDistribution) {
      Object.entries(account.followersData.locationDistribution).forEach(([location, value]) => {
        aggregated.locationDistribution[location] = (aggregated.locationDistribution[location] || 0) + (value as number);
      });
    }
    
    // Aggregate interest categories
    if (account.followersData?.interestCategories) {
      Object.entries(account.followersData.interestCategories).forEach(([interest, value]) => {
        aggregated.interestCategories[interest] = (aggregated.interestCategories[interest] || 0) + (value as number);
      });
    }
    
    // Aggregate income ranges
    if (account.followersData?.incomeRanges) {
      Object.entries(account.followersData.incomeRanges).forEach(([income, value]) => {
        aggregated.incomeRanges[income] = (aggregated.incomeRanges[income] || 0) + (value as number);
      });
    }
  });

  // Normalize distributions (divide by the number of accounts with that data)
  ['ageDistribution', 'genderDistribution', 'locationDistribution', 'interestCategories', 'incomeRanges'].forEach(key => {
    const distribution = aggregated[key as keyof typeof aggregated] as Record<string, number>;
    const total = Object.values(distribution).reduce((sum, value) => sum + value, 0);
    
    if (total > 0) {
      Object.keys(distribution).forEach(k => {
        distribution[k] = distribution[k] / total;
      });
    }
  });

  return aggregated;
}

/**
 * Generate pricing recommendations based on demographic data
 * This is a simplified implementation - in a real application, this would use
 * machine learning models trained on conversion data across different demographics
 */
function generatePricingRecommendations(
  demographics: any,
  productType: string,
  productCost?: number,
  targetMargin?: number
) {
  // Base pricing ranges by product type
  const basePriceRanges: Record<string, { min: number, max: number }> = {
    digital_product: { min: 19, max: 99 },
    physical_product: { min: 29, max: 149 },
    membership: { min: 9, max: 49 },
    service: { min: 99, max: 499 },
    affiliate_product: { min: 39, max: 199 }
  };

  // Get the base range for this product type
  const baseRange = basePriceRanges[productType] || basePriceRanges.digital_product;
  
  // If product cost and target margin are provided, calculate a minimum price
  let costBasedMin = 0;
  if (productCost !== undefined && targetMargin !== undefined) {
    costBasedMin = productCost / (1 - targetMargin);
  }

  // Use the higher of the cost-based minimum or the base minimum
  const minPrice = Math.max(baseRange.min, costBasedMin);
  const maxPrice = baseRange.max;
  
  // Generate optimal price point (simplified algorithm)
  // In a real application, this would use ML models trained on conversion data
  const optimalPrice = Math.round((minPrice + maxPrice) / 2);
  
  // Estimate conversion rate (simplified)
  // In a real application, this would be based on historical data and ML models
  const conversionRate = 0.04;
  
  // Set confidence level
  const confidence = 0.85;

  // Create segment-based recommendations
  const segments = [];
  
  // Core segment - based on the most common demographic attributes
  const topAge = Object.entries(demographics.ageDistribution)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '25-34';
    
  const topLocation = Object.entries(demographics.locationDistribution)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'North America';
    
  const topInterest = Object.entries(demographics.interestCategories)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Technology';

  segments.push({
    name: 'Core Audience',
    description: `Your core audience of ${topAge} year olds with ${topInterest.toLowerCase()} interests`,
    demographicTarget: {
      age: { [topAge]: 1 },
      location: { [topLocation]: 1 },
      interests: { [topInterest]: 1 }
    },
    recommendedPrices: [{
      amount: optimalPrice,
      conversionRate: 0.045, // Slightly higher than average
      confidence: 0.9
    }]
  });

  // Premium segment - higher price point for older/higher income demographics
  const olderAgeGroups = Object.entries(demographics.ageDistribution)
    .filter(([age]) => {
      const ageMin = parseInt(age.split('-')[0]);
      return ageMin >= 35;
    })
    .sort((a, b) => b[1] - a[1]);
    
  if (olderAgeGroups.length > 0) {
    const premiumAge = olderAgeGroups[0][0];
    const premiumLocation = topLocation;
    const premiumInterests = `${topInterest}, Business`;
    
    segments.push({
      name: 'Premium Segment',
      description: `Higher income professionals aged ${premiumAge}`,
      demographicTarget: {
        age: { [premiumAge]: 1 },
        location: { [premiumLocation]: 1 },
        interests: { 'Technology': 0.5, 'Business': 0.5 }
      },
      recommendedPrices: [{
        amount: Math.round(optimalPrice * 1.3), // 30% higher price
        conversionRate: 0.025, // Lower conversion but higher value
        confidence: 0.8
      }]
    });
  }

  // Value segment - lower price point for younger demographics
  const youngerAgeGroups = Object.entries(demographics.ageDistribution)
    .filter(([age]) => {
      const ageMin = parseInt(age.split('-')[0]);
      return ageMin < 25;
    })
    .sort((a, b) => b[1] - a[1]);
    
  if (youngerAgeGroups.length > 0) {
    const valueAge = youngerAgeGroups[0][0];
    
    segments.push({
      name: 'Value Segment',
      description: 'Younger audience, more price-sensitive',
      demographicTarget: {
        age: { [valueAge]: 1 },
        interests: { [topInterest]: 0.5, 'Education': 0.5 },
        location: { 'Global': 1 }
      },
      recommendedPrices: [{
        amount: Math.round(optimalPrice * 0.7), // 30% lower price
        conversionRate: 0.03,
        confidence: 0.75
      }]
    });
  }

  return {
    overallRecommendation: {
      minPrice,
      maxPrice,
      optimalPrice,
      conversionRate,
      confidence
    },
    segments
  };
} 