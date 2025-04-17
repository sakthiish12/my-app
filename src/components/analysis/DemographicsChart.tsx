'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface DemographicsData {
  industries: Array<{
    name: string;
    percentage: number;
  }>;
  locations: Array<{
    country: string;
    percentage: number;
  }>;
  seniority?: {
    entry: number;
    mid: number;
    senior: number;
    executive: number;
  };
}

interface DemographicsChartProps {
  userId: string;
}

export default function DemographicsChart({ userId }: DemographicsChartProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DemographicsData | null>(null);

  useEffect(() => {
    const fetchDemographics = async () => {
      try {
        // TODO: Replace with actual API call
        const mockData: DemographicsData = {
          industries: [
            { name: 'Technology', percentage: 35 },
            { name: 'Finance', percentage: 25 },
            { name: 'Healthcare', percentage: 20 },
            { name: 'Education', percentage: 15 },
            { name: 'Other', percentage: 5 },
          ],
          locations: [
            { country: 'United States', percentage: 45 },
            { country: 'United Kingdom', percentage: 20 },
            { country: 'Canada', percentage: 15 },
            { country: 'Australia', percentage: 10 },
            { country: 'Other', percentage: 10 },
          ],
          seniority: {
            entry: 20,
            mid: 40,
            senior: 30,
            executive: 10,
          },
        };
        
        setData(mockData);
      } catch (error) {
        console.error('Error fetching demographics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDemographics();
  }, [userId]);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div>No demographic data available</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Industry Distribution</h3>
        <div className="space-y-2">
          {data.industries.map((industry) => (
            <div key={industry.name} className="flex items-center">
              <div className="w-32 text-sm">{industry.name}</div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${industry.percentage}%` }}
                  />
                </div>
              </div>
              <div className="w-16 text-right text-sm">{industry.percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Geographic Distribution</h3>
        <div className="space-y-2">
          {data.locations.map((location) => (
            <div key={location.country} className="flex items-center">
              <div className="w-32 text-sm">{location.country}</div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${location.percentage}%` }}
                  />
                </div>
              </div>
              <div className="w-16 text-right text-sm">{location.percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      {data.seniority && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Seniority Levels</h3>
          <div className="space-y-2">
            {Object.entries(data.seniority).map(([level, percentage]) => (
              <div key={level} className="flex items-center">
                <div className="w-32 text-sm capitalize">{level}</div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right text-sm">{percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 