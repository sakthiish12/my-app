'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface RevenueData {
  totalRevenue: number;
  averagePrice: number;
  conversionRate: number;
  monthlyRevenue: {
    month: string;
    revenue: number;
  }[];
}

interface RevenueChartProps {
  userId: string;
}

export default function RevenueChart({ userId }: RevenueChartProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RevenueData | null>(null);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        // TODO: Replace with actual API call
        const mockData: RevenueData = {
          totalRevenue: 125000,
          averagePrice: 199,
          conversionRate: 2.8,
          monthlyRevenue: [
            { month: 'Jan', revenue: 35000 },
            { month: 'Feb', revenue: 42000 },
            { month: 'Mar', revenue: 48000 },
          ],
        };
        
        setData(mockData);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [userId]);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div>No revenue data available</div>;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const maxRevenue = Math.max(...data.monthlyRevenue.map(m => m.revenue));

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Revenue Analytics</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600">Total Revenue</div>
          <div className="text-2xl font-bold text-indigo-600">{formatCurrency(data.totalRevenue)}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600">Average Price</div>
          <div className="text-2xl font-bold text-indigo-600">{formatCurrency(data.averagePrice)}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600">Conversion Rate</div>
          <div className="text-2xl font-bold text-indigo-600">{data.conversionRate}%</div>
        </div>
      </div>

      <div className="mt-8">
        <h4 className="text-lg font-semibold mb-4">Monthly Revenue</h4>
        <div className="relative h-64">
          <div className="absolute inset-0 flex items-end justify-between">
            {data.monthlyRevenue.map((month) => (
              <div key={month.month} className="relative flex flex-col items-center w-1/3">
                <div
                  className="w-16 bg-indigo-600 rounded-t transition-all duration-500"
                  style={{
                    height: `${(month.revenue / maxRevenue) * 100}%`,
                  }}
                >
                  <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(month.revenue)}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">{month.month}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        * Revenue data is based on completed transactions
      </div>
    </div>
  );
} 