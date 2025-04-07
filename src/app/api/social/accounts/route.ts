import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    // Get user ID from Clerk authentication
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    const dbConnection = await connectToDatabase();
    if (!dbConnection) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Find user by Clerk ID
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json({ 
        accounts: [] 
      });
    }

    // Return social accounts
    return NextResponse.json({
      accounts: user.socialAccounts.map((account: any) => ({
        platform: account.platform,
        username: account.username,
        platformId: account.platformId,
        followers: account.followersData?.totalFollowers || 0,
        followersData: account.followersData,
        lastUpdated: account.lastUpdated
      }))
    });
  } catch (error) {
    console.error('Error fetching social accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch social accounts' }, { status: 500 });
  }
} 