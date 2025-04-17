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
        demographics: true,
        followerCount: true,
        industry: true,
        location: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching demographics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 