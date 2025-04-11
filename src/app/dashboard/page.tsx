import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import connectToDatabase from '@/lib/db'; // Assuming db connection utility exists
import User from '@/models/User'; // Assuming User model exists
import PricingData from '@/models/PricingData'; // Assuming PricingData model exists
// import { UserButton } from '@clerk/nextjs'; // UserButton might be in a different layout component now
import { Types } from 'mongoose';

// Define interface for social account structure if not already defined globally
interface SocialAccount {
  platform: string;
  username: string;
  accountId?: string;
  followers?: number;
  followersData?: any;
  lastUpdated?: Date;
}

// Define interface for PricingData structure if not already defined globally
interface Pricing {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  productType: string;
  recommendedPrice: number;
  priceRange: { min: number; max: number };
  socialPlatform: string;
  updatedAt: Date;
}


export default async function DashboardPage() {
  const { userId } = auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect('/sign-in');
  }

  // Initialize variables to hold data or default values
  let dbUser = null;
  let pricingHistory: Pricing[] = [];
  let dbError = false;

  try {
    // Connect to the database
     await connectToDatabase();

    // Find or create user in our database
    dbUser = await User.findOne({ clerkId: userId });

    if (!dbUser) {
       // Ensure necessary fields are provided, adjust default values as needed
      dbUser = await User.create({
        clerkId: userId,
        email: user.emailAddresses[0]?.emailAddress || 'no-email@example.com',
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed User',
        socialAccounts: [],
      });
    }

    // Get user's pricing data history if dbUser exists
    if (dbUser) {
        pricingHistory = await PricingData.find({ userId: dbUser._id })
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean<Pricing[]>(); // Use lean for plain JS objects and type casting
    }

  } catch (error) {
    console.error("Database operation failed:", error);
    dbError = true; // Set flag indicating DB error
  }


  // Render based on database status
  if (dbError) {
    return (
       // Simplified view for DB error
       <div>
        <h1 className="text-2xl font-bold mb-2">Welcome, {user.firstName || 'User'}!</h1>
        <p className="text-gray-600 mb-4">
           Could not connect to the database. Some features might be unavailable.
        </p>
         <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-sm" role="alert">
           <p className="font-bold">Database Connection Error</p>
           <p>We're unable to load your full dashboard data at the moment. Please try again later.</p>
         </div>
       </div>
     );
  }

  // --- Original Dashboard Content (restored) ---
  return (
    <div> {/* Removed outer div with min-h-screen and bg-gray-50, handled by layout */}
       {/* Header might be handled by a main layout, removed from here */}
       {/* <header className="bg-white shadow-sm"> ... </header> */}

       {/* Main content area */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user.firstName || 'User'}!</h1>
        <p className="text-gray-600">
          Analyze your social media audience and get pricing recommendations.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Social Media Accounts Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Social Media Accounts</h2>
          {dbUser?.socialAccounts && dbUser.socialAccounts.length > 0 ? (
            <ul className="space-y-3">
              {dbUser.socialAccounts.map((account: SocialAccount, index: number) => (
                <li key={index} className="flex items-center justify-between pb-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <span className="font-medium capitalize text-gray-700">{account.platform}</span>
                    <span className="text-gray-500 text-sm ml-2">@{account.username}</span>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {account.followers?.toLocaleString() ?? 'N/A'} followers
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No social accounts connected yet.</p>
          )}
          <div className="mt-5">
            <Link
              href="/dashboard/linkedin" // Link to the new linkedin page or an 'add account' page
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition duration-150 ease-in-out"
            >
              + Connect LinkedIn Account
            </Link>
            {/* Add links for other platforms later */}
          </div>
        </div>

        {/* Recent Analyses Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Analyses</h2>
          {pricingHistory.length > 0 ? (
            <ul className="space-y-4">
              {pricingHistory.map((pricing) => (
                <li key={pricing._id.toString()} className="border-b border-gray-100 pb-3 last:border-b-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium capitalize text-gray-700">{pricing.productType}</span>
                    <span className="text-lg font-semibold text-green-600">
                      ${pricing.recommendedPrice}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 flex justify-between">
                    <span>via {pricing.socialPlatform}</span>
                    <span>
                      Range: ${pricing.priceRange.min} - ${pricing.priceRange.max}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No pricing analyses found.</p>
          )}
          {/* Link to full history page if needed */}
          {/* <div className="mt-5">
            <Link
              href="/dashboard/history"
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition duration-150 ease-in-out"
            >
              View All Analyses
            </Link>
          </div> */}
        </div>

        {/* Quick Analysis / Call to Action Card */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-lg shadow-md text-white">
          <h2 className="text-xl font-semibold mb-3">Quick Analysis</h2>
          <p className="opacity-90 mb-5">
            Get instant pricing recommendations based on your audience.
          </p>
          <Link
            href="/dashboard/linkedin" // Link to the analysis page
            className="inline-block w-full px-5 py-2.5 bg-white text-indigo-600 font-medium rounded-md hover:bg-gray-100 transition duration-150 ease-in-out text-center shadow-sm"
          >
            Analyze LinkedIn Profile
          </Link>
        </div>
      </div>

      {/* Pricing Recommendations Links (Example) */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Explore Recommendations</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              'Courses', 'E-Books', 'Templates', 'Coaching',
              'Planners', 'Subscriptions', 'Software', 'Tutorials',
            ].map((product) => (
              <Link
                key={product}
                href={`/dashboard/analyze?product=${product.toLowerCase()}`} // Adjust link as needed
                className="bg-indigo-50 hover:bg-indigo-100 p-4 rounded-md text-center text-indigo-700 font-medium transition duration-150 ease-in-out"
              >
                {product}
              </Link>
            ))}
          </div>
        </div>
    </div>
  );
}
