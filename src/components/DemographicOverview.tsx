'use client';

import React from 'react';
import { formatCompactNumber, formatPercentage } from '../lib/utils';

interface DemographicOverviewProps {
  accounts: any[];
}

export default function DemographicOverview({ accounts }: DemographicOverviewProps) {
  // Calculate aggregate demographic data across all platforms
  const aggregatedData = React.useMemo(() => {
    if (!accounts || accounts.length === 0) {
      return {
        totalFollowers: 0,
        ageDistribution: {},
        genderDistribution: {},
        locationDistribution: {},
        interestCategories: {},
        incomeRanges: {}
      };
    }

    // Initialize aggregated data
    const aggregated = {
      totalFollowers: 0,
      ageDistribution: {} as Record<string, number>,
      genderDistribution: {} as Record<string, number>,
      locationDistribution: {} as Record<string, number>,
      interestCategories: {} as Record<string, number>,
      incomeRanges: {} as Record<string, number>
    };

    // Aggregate data from all accounts
    accounts.forEach(account => {
      // Add total followers
      aggregated.totalFollowers += account.followers || 0;
      
      // Aggregate age distribution
      if (account.followersData?.ageDistribution) {
        Object.entries(account.followersData.ageDistribution).forEach(([age, value]) => {
          aggregated.ageDistribution[age] = (aggregated.ageDistribution[age] || 0) + (value as number);
        });
      }
      
      // Aggregate gender distribution
      if (account.followersData?.genderDistribution) {
        Object.entries(account.followersData.genderDistribution).forEach(([gender, value]) => {
          aggregated.genderDistribution[gender] = (aggregated.genderDistribution[gender] || 0) + (value as number);
        });
      }
      
      // Aggregate location distribution
      if (account.followersData?.locationDistribution) {
        Object.entries(account.followersData.locationDistribution).forEach(([location, value]) => {
          aggregated.locationDistribution[location] = (aggregated.locationDistribution[location] || 0) + (value as number);
        });
      }
      
      // Aggregate interest categories
      if (account.followersData?.interestCategories) {
        Object.entries(account.followersData.interestCategories).forEach(([interest, value]) => {
          aggregated.interestCategories[interest] = (aggregated.interestCategories[interest] || 0) + (value as number);
        });
      }
      
      // Aggregate income ranges
      if (account.followersData?.incomeRanges) {
        Object.entries(account.followersData.incomeRanges).forEach(([income, value]) => {
          aggregated.incomeRanges[income] = (aggregated.incomeRanges[income] || 0) + (value as number);
        });
      }
    });

    // Normalize distributions (divide by the number of accounts with that data)
    ['ageDistribution', 'genderDistribution', 'locationDistribution', 'interestCategories', 'incomeRanges'].forEach(key => {
      const distribution = aggregated[key as keyof typeof aggregated] as Record<string, number>;
      const total = Object.values(distribution).reduce((sum, value) => sum + value, 0);
      
      if (total > 0) {
        Object.keys(distribution).forEach(k => {
          distribution[k] = distribution[k] / total;
        });
      }
    });

    return aggregated;
  }, [accounts]);

  // Helper function to sort distribution data for rendering
  const sortedDistribution = (data: Record<string, number>) => {
    return Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Follower Demographics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-900 mb-1">Total Followers</h3>
            <p className="text-2xl font-bold text-purple-700">
              {formatCompactNumber(aggregatedData.totalFollowers)}
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-1">Connected Platforms</h3>
            <p className="text-2xl font-bold text-blue-700">
              {accounts.length}
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900 mb-1">Top Location</h3>
            <p className="text-2xl font-bold text-green-700">
              {Object.entries(aggregatedData.locationDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
            </p>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-orange-900 mb-1">Top Interest</h3>
            <p className="text-2xl font-bold text-orange-700">
              {Object.entries(aggregatedData.interestCategories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Age Distribution */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Age Distribution</h3>
            {Object.keys(aggregatedData.ageDistribution).length > 0 ? (
              <div className="space-y-2">
                {sortedDistribution(aggregatedData.ageDistribution).map(([age, value]) => (
                  <div key={age} className="flex items-center">
                    <span className="w-16 text-sm text-gray-700">{age}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full" 
                        style={{ width: `${value * 100}%` }}
                      />
                    </div>
                    <span className="ml-2 text-sm text-gray-700">{formatPercentage(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No age data available</p>
            )}
          </div>
          
          {/* Gender Distribution */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Gender Distribution</h3>
            {Object.keys(aggregatedData.genderDistribution).length > 0 ? (
              <div className="space-y-2">
                {sortedDistribution(aggregatedData.genderDistribution).map(([gender, value]) => (
                  <div key={gender} className="flex items-center">
                    <span className="w-16 text-sm text-gray-700 capitalize">{gender}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${value * 100}%` }}
                      />
                    </div>
                    <span className="ml-2 text-sm text-gray-700">{formatPercentage(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No gender data available</p>
            )}
          </div>
          
          {/* Location Distribution */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Top Locations</h3>
            {Object.keys(aggregatedData.locationDistribution).length > 0 ? (
              <div className="space-y-2">
                {sortedDistribution(aggregatedData.locationDistribution).map(([location, value]) => (
                  <div key={location} className="flex items-center">
                    <span className="w-24 text-sm text-gray-700">{location}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${value * 100}%` }}
                      />
                    </div>
                    <span className="ml-2 text-sm text-gray-700">{formatPercentage(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No location data available</p>
            )}
          </div>
          
          {/* Interest Categories */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Top Interests</h3>
            {Object.keys(aggregatedData.interestCategories).length > 0 ? (
              <div className="space-y-2">
                {sortedDistribution(aggregatedData.interestCategories).map(([interest, value]) => (
                  <div key={interest} className="flex items-center">
                    <span className="w-24 text-sm text-gray-700">{interest}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full" 
                        style={{ width: `${value * 100}%` }}
                      />
                    </div>
                    <span className="ml-2 text-sm text-gray-700">{formatPercentage(value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No interest data available</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p>
          <strong>Note:</strong> Demographic data for personal profiles is estimated based on engagement 
          patterns and may not be 100% accurate. For more detailed analytics, consider upgrading to 
          business/creator profiles on your social media platforms.
        </p>
      </div>
    </div>
  );
} 