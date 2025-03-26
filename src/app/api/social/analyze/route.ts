import { NextRequest, NextResponse } from 'next/server';
import { getMockFollowerData } from '@/lib/mockSocialData';
import { analyzeAndRecommendPrice } from '@/lib/pricingEngine';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import PricingData from '@/models/PricingData';
import { auth } from '@clerk/nextjs/server';
import { SocialAccount } from '@/types/social';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { platform, username, productType } = await request.json();

    if (!platform || !username || !productType) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, username, or productType' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find or create user
    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      // In a real app, we'd get more user details from Clerk
      user = await User.create({
        clerkId: userId,
        email: 'user@example.com', // Placeholder, would come from Clerk in production
        name: 'User', // Placeholder, would come from Clerk in production
        socialAccounts: [],
      });
    }

    // Get demographic data (mock data in this prototype)
    const demographicData = getMockFollowerData(platform, username);

    // Add or update social account in user profile
    const existingAccountIndex = user.socialAccounts.findIndex(
      (account: SocialAccount) => account.platform === platform && account.username === username
    );

    if (existingAccountIndex >= 0) {
      user.socialAccounts[existingAccountIndex].followers = demographicData.totalFollowers;
      user.socialAccounts[existingAccountIndex].followersData = demographicData;
      user.socialAccounts[existingAccountIndex].lastUpdated = new Date();
    } else {
      user.socialAccounts.push({
        platform,
        username,
        followers: demographicData.totalFollowers,
        followersData: demographicData,
        lastUpdated: new Date(),
      });
    }

    await user.save();

    // Generate pricing recommendation
    const pricingRecommendation = analyzeAndRecommendPrice(productType, {
      totalFollowers: demographicData.totalFollowers,
      regions: demographicData.regions,
      engagementRate: demographicData.engagementRate,
    });

    // Save pricing recommendation
    await PricingData.findOneAndUpdate(
      {
        userId: user._id,
        socialPlatform: platform,
        productType,
      },
      {
        recommendedPrice: pricingRecommendation.recommendedPrice,
        priceRange: pricingRecommendation.priceRange,
        followerCount: demographicData.totalFollowers,
        demographicBreakdown: demographicData,
        conversionRatePrediction: pricingRecommendation.conversionRatePrediction,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      data: {
        demographicData,
        pricingRecommendation,
      },
    });
  } catch (error) {
    console.error('Error in social analysis API:', error);
    return NextResponse.json(
      { error: 'An error occurred during analysis' },
      { status: 500 }
    );
  }
} 