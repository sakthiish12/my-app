import { NextRequest, NextResponse } from 'next/server';
import { analyzeAndRecommendPrice } from '@/lib/pricingEngine';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import PricingData from '@/models/PricingData';
import { auth } from '@clerk/nextjs/server';
import { SocialAccount, DemographicData } from '@/types/social';
import { InstagramService } from '@/lib/services/instagram';

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
    const dbConnection = await connectToDatabase();
    if (!dbConnection) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Find user and check if they have the social account connected
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const socialAccount = user.socialAccounts.find(
      (account: SocialAccount) => account.platform === platform && account.username === username
    );

    if (!socialAccount) {
      return NextResponse.json(
        { error: `${platform} account @${username} is not connected. Please connect your account first.` },
        { status: 400 }
      );
    }

    if (!socialAccount.followersData || !socialAccount.lastUpdated || 
        Date.now() - socialAccount.lastUpdated.getTime() > 24 * 60 * 60 * 1000) {
      // Data is missing or older than 24 hours, need to refresh
      return NextResponse.json(
        { error: 'Account data is outdated. Please reconnect your social media account to refresh the data.' },
        { status: 400 }
      );
    }

    // Use the stored demographic data
    const demographicData = socialAccount.followersData;

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
      { error: 'An error occurred during analysis. Please try again later.' },
      { status: 500 }
    );
  }
} 