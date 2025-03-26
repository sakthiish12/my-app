import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { analyzePricing } from '@/lib/services/pricingAnalysis';

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const analysis = await analyzePricing(userId);

    if (analysis.error) {
      return new NextResponse(JSON.stringify({
        status: "error",
        message: analysis.error
      }), { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new NextResponse(JSON.stringify({
      status: "success",
      data: analysis
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Pricing analysis error:', error);
    return new NextResponse(JSON.stringify({
      status: "error",
      message: "Failed to analyze pricing"
    }), { status: 500 });
  }
} 