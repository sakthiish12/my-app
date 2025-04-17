import { Suspense } from 'react';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import PricingCalculator from '@/components/analysis/PricingCalculator';
import DemographicsChart from '@/components/analysis/DemographicsChart';
import EngagementMetrics from '@/components/analysis/EngagementMetrics';
import RevenueChart from '@/components/analysis/RevenueChart';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default async function AnalyzePage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Audience Analysis & Pricing</h1>
        <p className="text-gray-600">
          Get data-driven pricing recommendations based on your audience demographics and engagement metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pricing Calculator */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <Suspense fallback={<LoadingSpinner />}>
            <PricingCalculator userId={userId} />
          </Suspense>
        </div>

        {/* Demographics Visualization */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <Suspense fallback={<LoadingSpinner />}>
            <DemographicsChart userId={userId} />
          </Suspense>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <Suspense fallback={<LoadingSpinner />}>
            <EngagementMetrics userId={userId} />
          </Suspense>
        </div>

        {/* Revenue Analytics */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <Suspense fallback={<LoadingSpinner />}>
            <RevenueChart userId={userId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
} 