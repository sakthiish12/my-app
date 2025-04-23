import { NextResponse } from 'next/server';
import { neon, neonConfig } from '@neondatabase/serverless';

export const runtime = 'nodejs';

// Configure Neon
neonConfig.fetchConnectionCache = true;

// Initialize Neon client
const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Test query to check connection and table
    const result = await sql`
      SELECT NOW() as server_time, 
             (SELECT COUNT(*) FROM daily_prompts) as prompt_count
    `;
    
    return NextResponse.json({
      status: 'connected',
      server_time: result[0].server_time,
      prompt_count: result[0].prompt_count,
      database_url: process.env.DATABASE_URL?.slice(0, 20) + '...' // Show only the start of the URL for safety
    });
    
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to connect to database',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 