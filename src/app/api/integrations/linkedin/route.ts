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
    const { clientId, clientSecret, accessToken } = body;

    if (!clientId || !clientSecret) {
      return new NextResponse("Missing required credentials", { status: 400 });
    }

    // Connect to MongoDB
    const client = await MongoClient.connect(process.env.MONGODB_URI as string);
    const db = client.db("socioprice");
    
    // Store the credentials (encrypted in a production environment)
    await db.collection("integrations").updateOne(
      { userId, platform: "linkedin" },
      { 
        $set: {
          clientId,
          clientSecret,
          accessToken,
          updatedAt: new Date(),
          status: "connected"
        }
      },
      { upsert: true }
    );

    await client.close();

    // Here you would typically:
    // 1. Validate the credentials with LinkedIn API
    // 2. Store refresh token if applicable
    // 3. Set up webhooks for data sync

    return new NextResponse(JSON.stringify({
      status: "success",
      message: "LinkedIn integration successful"
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('LinkedIn integration error:', error);
    return new NextResponse(JSON.stringify({
      status: "error",
      message: "Failed to integrate LinkedIn"
    }), { status: 500 });
  }
} 