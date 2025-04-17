import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Get the last 3 months of analytics data
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const analytics = await prisma.analytics.findMany({
      where: {
        userId: params.userId,
        date: {
          gte: threeMonthsAgo,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    if (!analytics.length) {
      return NextResponse.json(
        { error: 'No analytics data found' },
        { status: 404 }
      );
    }

    // Calculate engagement metrics
    const latestAnalytics = analytics[analytics.length - 1];
    const trends = analytics.map(a => ({
      date: a.date.toISOString().slice(0, 7), // Format as YYYY-MM
      value: a.conversionRate || 0,
    }));

    const response = {
      ...latestAnalytics,
      trends,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching engagement metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 