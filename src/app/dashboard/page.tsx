import React from 'react';
import { auth } from '@clerk/nextjs/server';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const { userId } = auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect('/sign-in');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user.firstName || 'Creator'}! 👋</h1>
        <p className="text-gray-600">
          Let's optimize your pricing strategy with AI-powered insights.
        </p>
      </div>

      {/* Getting Started Steps */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Step 1: Connect Social */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center mb-4">
            <span className="bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3">1</span>
            <h2 className="text-xl font-semibold">Connect Platforms</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Start by connecting your social media accounts to analyze your audience.
          </p>
          <Link
            href="/dashboard/linkedin"
            className="inline-block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors"
          >
            Connect LinkedIn
          </Link>
        </div>

        {/* Step 2: Product Type */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center mb-4">
            <span className="bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3">2</span>
            <h2 className="text-xl font-semibold">Select Product</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Choose your digital product type for targeted recommendations.
          </p>
          <Link
            href="/dashboard/analyze"
            className="inline-block w-full px-4 py-2 bg-gray-100 text-gray-500 text-center rounded-md cursor-not-allowed"
          >
            Choose Product Type
          </Link>
        </div>

        {/* Step 3: Get Insights */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center mb-4">
            <span className="bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3">3</span>
            <h2 className="text-xl font-semibold">Get Insights</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Receive AI-powered pricing recommendations based on your audience.
          </p>
          <Link
            href="/dashboard/insights"
            className="inline-block w-full px-4 py-2 bg-gray-100 text-gray-500 text-center rounded-md cursor-not-allowed"
          >
            View Insights
          </Link>
        </div>
      </div>

      {/* Platform Integration Section */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold mb-4">Available Platforms</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'LinkedIn', status: 'available', href: '/dashboard/linkedin' },
            { name: 'Instagram', status: 'coming_soon' },
            { name: 'TikTok', status: 'coming_soon' },
            { name: 'YouTube', status: 'coming_soon' },
          ].map((platform) => (
            <div
              key={platform.name}
              className="p-4 border rounded-lg text-center"
            >
              <h3 className="font-medium">{platform.name}</h3>
              {platform.status === 'available' ? (
                <Link
                  href={platform.href}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Connect →
                </Link>
              ) : (
                <span className="text-sm text-gray-500">Coming Soon</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
