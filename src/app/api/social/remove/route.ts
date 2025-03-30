import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { platform, username } = await request.json();

    if (!platform || !username) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, username' },
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

    // Find user and remove the social account
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Filter out the account to be removed
    user.socialAccounts = user.socialAccounts.filter(
      (account: any) => !(account.platform === platform && account.username === username)
    );

    await user.save();

    return NextResponse.json({
      success: true,
      message: `${platform} account @${username} has been removed`,
    });

  } catch (error) {
    console.error('Error removing social account:', error);
    return NextResponse.json(
      { error: 'An error occurred while removing the account' },
      { status: 500 }
    );
  }
} 