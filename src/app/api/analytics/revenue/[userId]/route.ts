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
      select: {
        totalRevenue: true,
        averagePrice: true,
        conversionRate: true,
        date: true,
      },
    });

    if (!analytics.length) {
      return NextResponse.json(
        { error: 'No revenue data found' },
        { status: 404 }
      );
    }

    // Calculate totals and format monthly data
    const totalRevenue = analytics.reduce((sum, a) => sum + (a.totalRevenue || 0), 0);
    const averagePrice = analytics.reduce((sum, a) => sum + (a.averagePrice || 0), 0) / analytics.length;
    const conversionRate = analytics.reduce((sum, a) => sum + (a.conversionRate || 0), 0) / analytics.length;

    const monthlyRevenue = analytics.map(a => ({
      month: new Date(a.date).toLocaleString('default', { month: 'short' }),
      revenue: a.totalRevenue || 0,
    }));

    return NextResponse.json({
      totalRevenue,
      averagePrice,
      conversionRate,
      monthlyRevenue,
    });
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 