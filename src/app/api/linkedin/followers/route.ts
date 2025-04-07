import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { MongoClient } from 'mongodb';
import LinkedInService from '@/services/LinkedInService';
import LinkedInAuthService from '@/services/LinkedInAuthService';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { linkedinProfileUrl } = body;

    if (!linkedinProfileUrl) {
      return new NextResponse("LinkedIn profile URL is required", { status: 400 });
    }
    
    // Connect to MongoDB to get user data
    const client = await MongoClient.connect(process.env.MONGODB_URI as string);
    const db = client.db();
    
    // First check if we already have analytics for this user/profile
    const existingAnalytics = await db.collection("linkedin_analytics").findOne({ userId });
    
    // If there's existing data, return that instead of regenerating
    if (existingAnalytics) {
      console.log('Using existing LinkedIn analytics data');
      await client.close();
      
      return new NextResponse(JSON.stringify({
        status: "success",
        message: `Retrieved existing LinkedIn follower data`,
        followerCount: existingAnalytics.totalFollowers
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // Use admin PhantomBuster API key from environment variables
    const adminPhantomBusterApiKey = process.env.ADMIN_PHANTOMBUSTER_API_KEY;
    
    if (!adminPhantomBusterApiKey) {
      console.error('Admin PhantomBuster API key not configured in environment variables');
      await client.close();
      return new NextResponse(JSON.stringify({
        status: "error",
        message: "Server configuration error. Please contact support."
      }), { status: 500 });
    }
    
    // Check for LinkedIn OAuth tokens
    const linkedinIntegration = await db.collection("integrations").findOne({
      userId,
      platform: "linkedin"
    });
    
    let sessionCookie = '';
    
    // Try to get session cookie using OAuth token if available
    if (linkedinIntegration && linkedinIntegration.accessToken) {
      try {
        // Use OAuth tokens to get a session cookie
        sessionCookie = await LinkedInAuthService.getSessionCookieFromToken(linkedinIntegration.accessToken);
      } catch (error) {
        console.error('Error converting LinkedIn token to cookie:', error);
        // If token expired or invalid, suggest re-authenticating with LinkedIn
        await client.close();
        return new NextResponse(JSON.stringify({
          status: "error",
          message: "Your LinkedIn authorization has expired. Please reconnect your LinkedIn account.",
          code: "linkedin_auth_expired"
        }), { status: 401 });
      }
    } else {
      // Check for environment variable cookie as fallback
      sessionCookie = process.env.LINKEDIN_SESSION_COOKIE || '';
      
      if (!sessionCookie) {
        await client.close();
        return new NextResponse(JSON.stringify({
          status: "error",
          message: "LinkedIn authentication required. Please connect your LinkedIn account.",
          code: "linkedin_auth_required"
        }), { status: 401 });
      }
    }
    
    // Initialize LinkedIn service with admin PhantomBuster API key
    const linkedInService = new LinkedInService(adminPhantomBusterApiKey);
    
    // Store the LinkedIn profile URL with the user for consistency
    await db.collection("user_profiles").updateOne(
      { userId }, 
      { $set: { linkedinUrl: linkedinProfileUrl, updatedAt: new Date() } },
      { upsert: true }
    );
    
    // Set the session cookie in environment for this request
    process.env.LINKEDIN_SESSION_COOKIE = sessionCookie;
    
    // Use a standard phantom ID or create one based on the user's ID
    const phantomId = process.env.ADMIN_PHANTOMBUSTER_PHANTOM_ID || `user_${userId.slice(-8)}`;
    
    // Fetch and process LinkedIn followers with the phantom ID
    const followerCount = await linkedInService.fetchAndSaveFollowers(userId, linkedinProfileUrl, phantomId);
    
    await client.close();
    
    return new NextResponse(JSON.stringify({
      status: "success",
      message: `Successfully processed ${followerCount} LinkedIn followers`,
      followerCount
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('LinkedIn followers processing error:', error);
    return new NextResponse(JSON.stringify({
      status: "error",
      message: "Failed to process LinkedIn followers",
      error: error instanceof Error ? error.message : String(error)
    }), { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // For development purposes - use mock data instead of actual database calls
    const mockAnalytics = {
      totalFollowers: 1250,
      industries: {
        "Software Development": 28,
        "Marketing": 15,
        "Sales": 12,
        "Finance": 10,
        "Design": 8,
        "Education": 7,
        "Healthcare": 6,
        "Human Resources": 5,
        "Consulting": 5,
        "Operations": 4,
      },
      locations: {
        "United States": 35,
        "United Kingdom": 12,
        "India": 10,
        "Canada": 8,
        "Australia": 7,
        "Germany": 6,
        "France": 5,
        "Brazil": 4,
        "Spain": 4,
        "Netherlands": 3,
      },
      companies: {
        "Google": 5,
        "Microsoft": 4,
        "Amazon": 4,
        "Facebook": 3,
        "Apple": 3,
        "IBM": 2,
        "Oracle": 2,
        "Salesforce": 2,
        "Adobe": 2,
        "Twitter": 1,
      },
      jobTitles: {
        "Software Engineer": 15,
        "Product Manager": 12,
        "Marketing Manager": 10,
        "Sales Representative": 8,
        "Data Scientist": 7,
        "UX Designer": 6,
        "Project Manager": 5,
        "Business Analyst": 5,
        "Account Manager": 4,
        "Content Writer": 3,
      },
      seniority: {
        "Senior": 35,
        "Mid-Level": 40,
        "Junior": 15,
        "Executive": 10,
      },
      recommendedPricing: {
        digitalProducts: {
          ebook: { min: 9, max: 29, optimal: 19 },
          onlineCourse: { min: 99, max: 499, optimal: 249 },
          template: { min: 29, max: 89, optimal: 59 },
          coaching: { min: 99, max: 299, optimal: 179, hourly: 125 },
          membership: { min: 19, max: 99, optimal: 49 },
        },
        premiumTiers: {
          basic: { 
            price: 29,
            features: [
              "Basic Feature 1",
              "Basic Feature 2",
              "Basic Feature 3",
              "Basic Feature 4",
              "Email support"
            ]
          },
          professional: { 
            price: 79,
            features: [
              "All Basic features",
              "Pro Feature 1",
              "Pro Feature 2",
              "Pro Feature 3",
              "Priority support"
            ]
          },
          enterprise: { 
            price: 199,
            features: [
              "All Professional features",
              "Enterprise Feature 1",
              "Enterprise Feature 2",
              "Enterprise Feature 3",
              "Dedicated account manager"
            ]
          },
        },
      },
      productRecommendations: {
        highDemand: [
          "LinkedIn Profile Optimization Template",
          "B2B Sales Mastery Course",
          "Content Creation Framework",
          "Personal Branding Workbook",
          "Lead Generation System"
        ],
        niche: [
          "Industry-Specific Templates",
          "Specialized Data Analysis Tools",
          "Vertical-Specific Consulting Packages",
          "Role-Based Training Programs",
          "Executive Communication Workshop",
          "Leadership Development Program"
        ],
        trending: [
          "AI Implementation Guide",
          "Remote Work Productivity System",
          "Video Marketing Toolkit",
          "Personal Knowledge Management System",
          "Data Visualization Templates",
          "Career Transition Program"
        ],
      }
    };
    
    return new NextResponse(JSON.stringify({
      status: "success",
      data: mockAnalytics
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('LinkedIn analytics error:', error);
    return new NextResponse(JSON.stringify({
      status: "error",
      message: "Failed to fetch LinkedIn analytics",
      error: error instanceof Error ? error.message : String(error)
    }), { status: 500 });
  }
} 