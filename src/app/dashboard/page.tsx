import { auth } from '@clerk/nextjs/server';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import PricingData from '@/models/PricingData';
import { UserButton } from '@clerk/nextjs';
import { Types } from 'mongoose';

export default async function Dashboard() {
  const { userId } = auth();
  const user = await currentUser();
  
  if (!userId || !user) {
    redirect('/sign-in');
  }

  // Connect to the database
  await connectToDatabase();
  
  // Find or create user in our database
  let dbUser = await User.findOne({ clerkId: userId });
  
  if (!dbUser) {
    dbUser = await User.create({
      clerkId: userId,
      email: user.emailAddresses[0]?.emailAddress || '',
      name: `${user.firstName} ${user.lastName}`,
      socialAccounts: [],
    });
  }
  
  // Get user's pricing data history
  const pricingHistory = await PricingData.find({ userId: dbUser._id })
    .sort({ updatedAt: -1 })
    .limit(5)
    .lean();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            PeakPrice
          </Link>
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome, {user.firstName}!</h1>
          <p className="text-gray-600">
            Analyze your social media audience and get pricing recommendations for your digital products.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Social Media Accounts</h2>
            {dbUser.socialAccounts && dbUser.socialAccounts.length > 0 ? (
              <ul className="space-y-2">
                {dbUser.socialAccounts.map((account: {
                  platform: string;
                  username: string;
                  accountId?: string;
                  followers?: number;
                  followersData?: any;
                  lastUpdated?: Date;
                }, index: number) => (
                  <li key={index} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium capitalize">{account.platform}</span>
                      <span className="text-gray-500 ml-2">@{account.username}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {account.followers?.toLocaleString()} followers
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No social accounts connected yet.</p>
            )}
            <div className="mt-4">
              <Link
                href="/dashboard/analyze"
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                + Add Social Account
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Recent Analyses</h2>
            {pricingHistory.length > 0 ? (
              <ul className="space-y-3">
                {pricingHistory.map((pricing, index: number) => (
                  <li key={index} className="border-b pb-2">
                    <div className="flex justify-between">
                      <span className="font-medium capitalize">{pricing.productType}</span>
                      <span className="text-green-600 font-medium">
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
              <p className="text-gray-500">No pricing analyses yet.</p>
            )}
            <div className="mt-4">
              <Link
                href="/dashboard/history"
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                View All Analyses
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Quick Analysis</h2>
            <p className="text-gray-600 mb-4">
              Analyze your social media audience and get pricing recommendations instantly.
            </p>
            <Link
              href="/dashboard/analyze"
              className="inline-block w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-center"
            >
              Start New Analysis
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Pricing Recommendations</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              'Courses',
              'E-Books',
              'Templates',
              'Coaching',
              'Planners',
              'Subscriptions',
              'Software',
              'Digital Art',
              'Tutorials',
            ].map((product) => (
              <Link
                key={product}
                href={`/dashboard/analyze?product=${product.toLowerCase()}`}
                className="bg-indigo-50 hover:bg-indigo-100 p-4 rounded-md text-center"
              >
                {product}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 