import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const profile = await prisma.profile.findUnique({
      where: {
        userId: params.userId,
      },
      select: {
        followerCount: true,
        engagementRate: true,
        industry: true,
        location: true,
        averagePrice: true,
        priceMultiplier: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Calculate base metrics that affect pricing
    const baseMetrics = {
      followerImpact: profile.followerCount > 10000 ? 1.5 : 1,
      engagementImpact: profile.engagementRate > 0.05 ? 1.3 : 1,
      industryImpact: ['technology', 'finance', 'healthcare'].includes(profile.industry.toLowerCase()) ? 1.2 : 1,
    };

    // Calculate recommended price range
    const basePrice = profile.averagePrice || 100;
    const multiplier = profile.priceMultiplier || 1;
    const totalMultiplier = Object.values(baseMetrics).reduce((acc, val) => acc * val, 1) * multiplier;
    
    const recommendedPrice = Math.round(basePrice * totalMultiplier);
    const priceRange = {
      min: Math.round(recommendedPrice * 0.8),
      max: Math.round(recommendedPrice * 1.2),
    };

    return NextResponse.json({
      baseMetrics,
      currentPrice: {
        base: basePrice,
        multiplier: multiplier,
      },
      recommendedPrice,
      priceRange,
      profile: {
        followerCount: profile.followerCount,
        engagementRate: profile.engagementRate,
        industry: profile.industry,
        location: profile.location,
      },
    });
  } catch (error) {
    console.error('Error fetching pricing data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 