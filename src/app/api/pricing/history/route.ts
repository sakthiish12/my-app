import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import PricingData from '@/models/PricingData';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
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
    
    // If database connection failed, return empty data with a message
    if (!dbConnection) {
      return NextResponse.json({
        success: false,
        message: 'Database connection unavailable',
        data: []
      });
    }

    // Find user
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get pricing data history
    const pricingData = await PricingData.find({ userId: user._id })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: pricingData,
    });
  } catch (error) {
    console.error('Error fetching pricing history:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching pricing history' },
      { status: 500 }
    );
  }
} 