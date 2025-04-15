import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { clerkClient } from '@clerk/nextjs';

// Debug endpoint to check the LinkedIn integration
export async function GET(request: NextRequest) {
  try {
    console.log('LinkedIn debug endpoint called');
    let userId = null;
    let userData = null;
    
    // Try multiple ways to get the user ID
    try {
      // 1. From query param
      const url = new URL(request.url);
      const queryUserId = url.searchParams.get('userId');
      
      if (queryUserId) {
        userId = queryUserId;
        console.log("Got userId from query param:", userId);
      } else {
        // 2. From session cookie
        const cookieStore = cookies();
        const sessionCookie = cookieStore.get('__session')?.value;
        
        if (sessionCookie) {
          try {
            const base64Payload = sessionCookie.split('.')[1];
            const payload = JSON.parse(atob(base64Payload));
            userId = payload.sub;
            console.log("Extracted userId from cookie:", userId);
          } catch (e) {
            console.error("Error extracting userId from cookie:", e);
          }
        }
      }
      
      // Try to get user data from Clerk
      if (userId) {
        try {
          const clerkUser = await clerkClient.users.getUser(userId);
          userData = {
            id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName
          };
          console.log("Retrieved user data from Clerk");
        } catch (clerkError) {
          console.error("Error getting user from Clerk:", clerkError);
        }
      }
    } catch (authError) {
      console.error("Error getting user ID:", authError);
    }
    
    // Now try to connect to database regardless of auth status
    try {
      console.log("Attempting database connection...");
      await connectToDatabase();
      
      // Even if we don't have a userId, report on database connection
      let dbStatus = {
        connected: true,
        error: null
      };
      
      // If we have a userId, check for LinkedIn connection
      let linkedin = null;
      if (userId) {
        try {
          const user = await User.findOne({ clerkId: userId }).lean();
          console.log("User found in database:", !!user);
          
          if (user) {
            linkedin = {
              connected: !!user.linkedin?.accessToken,
              lastUpdated: user.linkedin?.lastUpdated,
              databaseData: user
            };
          } else {
            linkedin = { connected: false, message: "User not found in database" };
          }
        } catch (dbError) {
          console.error("Error querying user:", dbError);
          linkedin = { connected: false, error: String(dbError) };
        }
      }
      
      // Check total user count regardless of userId
      let totalUsers = null;
      try {
        totalUsers = await User.countDocuments();
      } catch (countError) {
        console.error("Error counting users:", countError);
      }
      
      return NextResponse.json({
        success: true,
        userId,
        clerk: userData,
        database: {
          status: dbStatus,
          totalUsers
        },
        linkedin
      });
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json({
        success: false,
        userId,
        clerk: userData,
        database: {
          status: {
            connected: false,
            error: String(dbError)
          }
        }
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 