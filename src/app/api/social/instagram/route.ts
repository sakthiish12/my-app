import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { InstagramService } from '@/lib/services/instagram';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { appId, appSecret, code } = body;

    if (!appId || !appSecret || !code) {
      return new NextResponse("Missing required credentials", { status: 400 });
    }

    // Initialize Instagram service
    const instagramService = new InstagramService({ appId, appSecret });
    
    // Get access token
    const accessToken = await instagramService.getAccessToken(code);
    
    // Get demographic data
    const demographicData = await instagramService.getFullDemographicData(accessToken);
    
    // Get user profile for username
    const profile = await instagramService.getUserProfile(accessToken);
    
    // Connect to database
    const dbConnection = await connectToDatabase();
    if (!dbConnection) {
      throw new Error('Database connection failed');
    }

    // Find or create user
    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      user = await User.create({
        clerkId: userId,
        email: 'user@example.com', // Would come from Clerk in production
        name: 'User', // Would come from Clerk in production
        socialAccounts: [],
      });
    }

    // Update or add Instagram account
    const existingAccountIndex = user.socialAccounts.findIndex(
      (account: any) => account.platform === 'instagram' && account.username === profile.username
    );

    if (existingAccountIndex >= 0) {
      user.socialAccounts[existingAccountIndex] = {
        platform: 'instagram',
        username: profile.username,
        accountId: profile.id,
        followers: demographicData.totalFollowers,
        followersData: demographicData,
        lastUpdated: new Date(),
      };
    } else {
      user.socialAccounts.push({
        platform: 'instagram',
        username: profile.username,
        accountId: profile.id,
        followers: demographicData.totalFollowers,
        followersData: demographicData,
        lastUpdated: new Date(),
      });
    }

    await user.save();

    return new NextResponse(JSON.stringify({
      success: true,
      data: {
        profile,
        demographicData,
      },
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Instagram integration error:', error);
    return new NextResponse(JSON.stringify({
      success: false,
      error: 'Failed to integrate Instagram account',
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 