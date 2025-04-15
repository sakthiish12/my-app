import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      console.log('No authenticated user for LinkedIn status check');
      return NextResponse.json({ isConnected: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Connect to database
    try {
      await connectToDatabase();
    } catch (dbError) {
      console.error('Database connection error in LinkedIn status check:', dbError);
      // Return false but don't fail the request
      return NextResponse.json({ isConnected: false, error: 'Database error' });
    }
    
    // Find user and check LinkedIn connection
    try {
      console.log(`Looking for user with clerkId: ${userId}`);
      const user = await User.findOne({ clerkId: userId });
      
      if (!user) {
        console.log(`User with clerkId ${userId} not found in database`);
        return NextResponse.json({ 
          isConnected: false, 
          error: 'User not found',
          debug: { 
            userId, 
            userFound: false 
          } 
        });
      }
      
      console.log(`User found:`, {
        id: user._id,
        clerkId: user.clerkId,
        hasLinkedinData: !!user.linkedin,
        linkedinAccessToken: user.linkedin?.accessToken ? 'Present' : 'Missing',
        linkedinLastUpdated: user.linkedin?.lastUpdated
      });
      
      // Check if user has valid LinkedIn token
      const isConnected = !!(user?.linkedin?.accessToken);
      
      console.log(`LinkedIn status for user ${userId}: ${isConnected ? 'Connected' : 'Not connected'}`);
      
      return NextResponse.json({ 
        isConnected,
        linkedinData: isConnected ? {
          // Return minimal data to confirm connection
          lastUpdated: user?.linkedin?.lastUpdated
        } : null,
        debug: {
          userId,
          userFound: true,
          hasLinkedinField: !!user.linkedin,
          hasToken: !!(user?.linkedin?.accessToken)
        }
      });
    } catch (findError) {
      console.error('Error finding user in LinkedIn status check:', findError);
      return NextResponse.json({ isConnected: false, error: 'User lookup error' });
    }
  } catch (error) {
    console.error('Unexpected error in LinkedIn status check:', error);
    return NextResponse.json({ isConnected: false, error: 'Internal server error' }, { status: 500 });
  }
} 