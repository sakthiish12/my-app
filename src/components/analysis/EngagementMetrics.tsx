'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface EngagementData {
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  trends: {
    date: string;
    value: number;
  }[];
}

interface EngagementMetricsProps {
  userId: string;
}

export default function EngagementMetrics({ userId }: EngagementMetricsProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EngagementData | null>(null);

  useEffect(() => {
    const fetchEngagement = async () => {
      try {
        // TODO: Replace with actual API call
        const mockData: EngagementData = {
          likes: 15234,
          comments: 892,
          shares: 456,
          engagementRate: 4.2,
          trends: [
            { date: '2024-01', value: 3.8 },
            { date: '2024-02', value: 4.1 },
            { date: '2024-03', value: 4.2 },
          ],
        };
        
        setData(mockData);
      } catch (error) {
        console.error('Error fetching engagement metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEngagement();
  }, [userId]);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div>No engagement data available</div>;

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Engagement Metrics</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600">Total Likes</div>
          <div className="text-2xl font-bold text-indigo-600">{formatNumber(data.likes)}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600">Comments</div>
          <div className="text-2xl font-bold text-indigo-600">{formatNumber(data.comments)}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600">Shares</div>
          <div className="text-2xl font-bold text-indigo-600">{formatNumber(data.shares)}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600">Engagement Rate</div>
          <div className="text-2xl font-bold text-indigo-600">{data.engagementRate}%</div>
        </div>
      </div>

      <div className="mt-8">
        <h4 className="text-lg font-semibold mb-4">Engagement Trend</h4>
        <div className="relative h-48">
          {data.trends.map((point, index) => {
            const x = (index / (data.trends.length - 1)) * 100;
            const y = 100 - (point.value / 5) * 100; // Normalize to 0-5% range
            
            return (
              <div
                key={point.date}
                className="absolute w-2 h-2 bg-indigo-600 rounded-full transform -translate-x-1 -translate-y-1"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                }}
              >
                <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2">
                  <div className="text-xs text-gray-600">{point.value}%</div>
                </div>
                <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2">
                  <div className="text-xs text-gray-600">{point.date}</div>
                </div>
              </div>
            );
          })}
          
          {/* Connect dots with lines */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
            <polyline
              points={data.trends
                .map((point, index) => {
                  const x = (index / (data.trends.length - 1)) * 100;
                  const y = 100 - (point.value / 5) * 100;
                  return `${x},${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
    </div>
  );
} 