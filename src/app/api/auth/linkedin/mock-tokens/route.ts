// This is a development-only API for handling LinkedIn OAuth
// without requiring MongoDB

import { NextResponse } from 'next/server';

// Simple in-memory store (will be cleared on server restart)
const tokenStore: Record<string, any> = {};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  
  if (!userId) {
    // Return stats about the token store if no userId is provided
    return NextResponse.json({
      message: "LinkedIn mock token store - for development only",
      tokenCount: Object.keys(tokenStore).length
    });
  }
  
  const userTokens = tokenStore[userId];
  
  if (!userTokens) {
    return NextResponse.json({
      error: "No tokens found for user",
      userId
    }, { status: 404 });
  }
  
  return NextResponse.json({
    status: "success",
    tokens: userTokens
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, tokens } = body;
    
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }
    
    if (!tokens || !tokens.accessToken) {
      return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
    }
    
    // Store tokens with timestamp
    tokenStore[userId] = {
      ...tokens,
      storedAt: new Date().toISOString(),
      platform: 'linkedin'
    };
    
    return NextResponse.json({
      status: "success",
      message: "Tokens stored in mock store",
      userId
    });
  } catch (error) {
    console.error('Error storing mock tokens:', error);
    return NextResponse.json({ 
      error: "Failed to store tokens", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 