'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

const socialPlatforms = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'threads', label: 'Threads' },
  { value: 'pinterest', label: 'Pinterest' },
];

const productTypes = [
  { value: 'course', label: 'Course' },
  { value: 'ebook', label: 'E-Book' },
  { value: 'template', label: 'Template' },
  { value: 'coaching', label: 'Coaching' },
  { value: 'planner', label: 'Planner' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'software', label: 'Software' },
  { value: 'digitalArt', label: 'Digital Art' },
  { value: 'tutorial', label: 'Tutorial' },
];

export default function AnalyzePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [platform, setPlatform] = useState(socialPlatforms[0].value);
  const [username, setUsername] = useState('');
  const [productType, setProductType] = useState(
    searchParams.get('product') || productTypes[0].value
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/social/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          username,
          productType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setResult(data.data);
      // Optionally redirect to a results page
      // router.push(`/dashboard/results?id=${data.data.id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-indigo-600">
            PeakPrice
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-indigo-600 hover:text-indigo-800"
            >
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Analyze Your Audience</h1>
            <p className="text-gray-600">
              Enter your social media account details to get personalized pricing recommendations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-1">
                  Social Media Platform
                </label>
                <select
                  id="platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  {socialPlatforms.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username or Account ID
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-100 text-gray-600 border border-r-0 border-gray-300 rounded-l-md">
                    @
                  </span>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-r-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="username"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="productType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Digital Product Type
                </label>
                <select
                  id="productType"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  {productTypes.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {error && <div className="text-red-500 mb-4">{error}</div>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
              >
                {isLoading ? 'Analyzing...' : 'Analyze & Get Price Recommendation'}
              </button>
            </form>
          </div>

          {result && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4">Analysis Result</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Audience Demographics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Total Followers</p>
                    <p className="text-lg font-medium">
                      {result.demographicData.totalFollowers.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Engagement Rate</p>
                    <p className="text-lg font-medium">
                      {(result.demographicData.engagementRate * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Top Regions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {result.demographicData.regions.slice(0, 4).map((region: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-3 rounded">
                      <p className="font-medium">{region.name}</p>
                      <p className="text-gray-600">{region.percentage}%</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold mb-4 text-indigo-600">Recommended Price</h3>
                <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-lg mb-4">
                  <div>
                    <p className="text-gray-700 mb-1">Optimal Price</p>
                    <p className="text-3xl font-bold text-indigo-600">
                      ${result.pricingRecommendation.recommendedPrice}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-700 mb-1">Price Range</p>
                    <p className="text-lg">
                      ${result.pricingRecommendation.priceRange.min} - ${result.pricingRecommendation.priceRange.max}
                    </p>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Estimated Conversion Rate</p>
                    <p className="font-bold">
                      {(result.pricingRecommendation.conversionRatePrediction * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <p className="mt-6 text-gray-600 text-sm">
                  This pricing recommendation is based on your followers' location, purchasing power, 
                  audience size, and engagement rate. Adjust based on your specific product features and value.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 