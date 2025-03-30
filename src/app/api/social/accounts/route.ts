import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
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

    // Find user and get their social accounts
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return only connected accounts with valid data
    const connectedAccounts = user.socialAccounts.filter((account: any) => 
      account.followersData && 
      account.lastUpdated &&
      Date.now() - new Date(account.lastUpdated).getTime() <= 24 * 60 * 60 * 1000
    );

    return NextResponse.json({
      success: true,
      accounts: connectedAccounts,
    });

  } catch (error) {
    console.error('Error fetching social accounts:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching accounts' },
      { status: 500 }
    );
  }
} 