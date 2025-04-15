import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';

// Simple endpoint to test database connectivity
export async function GET() {
  try {
    // Attempt to connect to database
    console.log("Testing database connection...");
    const dbConnection = await connectToDatabase();
    
    if (!dbConnection) {
      console.error("Failed to connect to database");
      return NextResponse.json({ 
        success: false, 
        message: "Database connection failed", 
        error: "No connection returned"
      }, { status: 500 });
    }
    
    console.log("Database connection successful");
    
    // Try a simple query to verify full functionality
    try {
      const count = await User.countDocuments();
      console.log(`Found ${count} users in database`);
      
      return NextResponse.json({ 
        success: true, 
        message: "Database connection successful", 
        dbStatus: "connected",
        userCount: count
      });
    } catch (queryError) {
      console.error("Error querying database:", queryError);
      return NextResponse.json({ 
        success: false, 
        message: "Connected to database but query failed", 
        error: queryError instanceof Error ? queryError.message : String(queryError),
        dbStatus: "connected but query failed"
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to connect to database", 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 