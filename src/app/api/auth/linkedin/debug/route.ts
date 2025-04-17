import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Debug endpoint for LinkedIn OAuth flow
 * This route will log all parameters and cookies for debugging purposes
 */
export async function GET(request: NextRequest) {
  console.log('LinkedIn debug route accessed');

  try {
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const cookieStore = cookies();
    const allCookies = Array.from(cookieStore.getAll()).map(c => ({ 
      name: c.name, 
      value: c.name.includes('token') ? `${c.value.substring(0, 10)}...` : c.value 
    }));
    
    // Collect headers
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Collect all debug data
    const debugData = {
      timestamp: new Date().toISOString(),
      url: request.url,
      method: request.method,
      params,
      cookies: allCookies,
      headers,
      env: {
        LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID ? 'Set' : 'Not set',
        LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET ? 'Set' : 'Not set',
        LINKEDIN_CALLBACK_URL: process.env.LINKEDIN_CALLBACK_URL,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
      }
    };

    console.log('LinkedIn debug data:', JSON.stringify(debugData, null, 2));

    // Return formatted debug info
    return NextResponse.json({
      status: 'ok',
      message: 'LinkedIn OAuth debug information',
      debug: debugData
    });
  } catch (error) {
    console.error('LinkedIn debug error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Error processing debug request', 
      error: (error as Error).message 
    }, { status: 500 });
  }
} 