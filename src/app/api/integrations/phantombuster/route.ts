import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { MongoClient } from 'mongodb';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { apiKey, phantomId } = body;

    if (!apiKey) {
      return new NextResponse("PhantomBuster API key is required", { status: 400 });
    }

    // For development - skip database storage
    console.log(`Received PhantomBuster API key for user ${userId}`);
    
    // In a production environment, we would store this in MongoDB
    // For now, we'll just return success without actual storage

    return new NextResponse(JSON.stringify({
      status: "success",
      message: "PhantomBuster integration successful"
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('PhantomBuster integration error:', error);
    return new NextResponse(JSON.stringify({
      status: "error",
      message: "Failed to integrate PhantomBuster"
    }), { status: 500 });
  }
} 