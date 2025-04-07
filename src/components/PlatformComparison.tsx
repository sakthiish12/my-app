'use client';

import React from 'react';
import { formatCompactNumber, formatPercentage } from '../lib/utils';

interface PlatformComparisonProps {
  accounts: any[];
}

export default function PlatformComparison({ accounts }: PlatformComparisonProps) {
  const platforms = React.useMemo(() => {
    if (!accounts || accounts.length === 0) {
      return [];
    }

    return accounts.map(account => {
      const { platform, username, followers, followersData } = account;
      
      // Extract the most notable metrics for this platform
      const topAge = followersData?.ageDistribution ? 
        Object.entries(followersData.ageDistribution)
          .sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] : null;
      
      const topLocation = followersData?.locationDistribution ? 
        Object.entries(followersData.locationDistribution)
          .sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] : null;
      
      const topInterest = followersData?.interestCategories ? 
        Object.entries(followersData.interestCategories)
          .sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] : null;
      
      const engagementRate = followersData?.engagementRate || 0;
      
      return {
        platform,
        username,
        followers: followers || 0,
        topAge,
        topLocation,
        topInterest,
        engagementRate,
        malePercent: followersData?.genderDistribution?.male || 0,
        femalePercent: followersData?.genderDistribution?.female || 0,
        rawData: followersData
      };
    });
  }, [accounts]);

  // Color mapping for platforms
  const platformColors: Record<string, string> = {
    instagram: '#E1306C',
    facebook: '#1877F2',
    linkedin: '#0A66C2',
    tiktok: '#000000',
    pinterest: '#BD081C',
    threads: '#000000',
    default: '#6B7280'
  };

  const getPlatformColor = (platform: string): string => {
    return platformColors[platform.toLowerCase()] || platformColors.default;
  };

  // Helper function to get platform icon
  const getPlatformIcon = (platform: string): string => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return 'instagram';
      case 'facebook':
        return 'facebook-f';
      case 'linkedin':
        return 'linkedin-in';
      case 'tiktok':
        return 'tiktok';
      case 'pinterest':
        return 'pinterest-p';
      case 'threads':
        return 'at'; // Using @ as a substitute for Threads icon
      default:
        return 'question';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Platform Comparison</h2>
        
        {platforms.length === 0 ? (
          <p className="text-gray-500 italic">No social media accounts connected.</p>
        ) : (
          <>
            {/* Platform Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {platforms.map((platform, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div 
                    className="py-3 px-4 flex items-center" 
                    style={{ backgroundColor: getPlatformColor(platform.platform) + '15' }}
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                      style={{ backgroundColor: getPlatformColor(platform.platform) }}
                    >
                      <i className={`fab fa-${getPlatformIcon(platform.platform)} text-white text-sm`}></i>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 capitalize">{platform.platform}</h3>
                      <p className="text-sm text-gray-600">@{platform.username}</p>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Followers</span>
                      <span className="text-sm font-medium text-gray-900">{formatCompactNumber(platform.followers)}</span>
                    </div>
                    
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Engagement</span>
                      <span className="text-sm font-medium text-gray-900">{formatPercentage(platform.engagementRate)}</span>
                    </div>
                    
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Top Age Group</span>
                      <span className="text-sm font-medium text-gray-900">{platform.topAge || 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Top Location</span>
                      <span className="text-sm font-medium text-gray-900">{platform.topLocation || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Comparative Charts */}
            <div className="space-y-8">
              {/* Followers Comparison */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Followers Comparison</h3>
                <div className="space-y-3">
                  {platforms.map((platform, index) => {
                    const maxFollowers = Math.max(...platforms.map(p => p.followers));
                    const percentage = maxFollowers > 0 ? (platform.followers / maxFollowers) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex items-center">
                        <div className="w-20 md:w-28 text-sm text-gray-700 capitalize">{platform.platform}</div>
                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: getPlatformColor(platform.platform)
                            }}
                          />
                        </div>
                        <span className="ml-2 text-sm text-gray-700 font-medium">
                          {formatCompactNumber(platform.followers)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Engagement Rate Comparison */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Engagement Rate Comparison</h3>
                <div className="space-y-3">
                  {platforms.map((platform, index) => {
                    const maxEngagement = Math.max(...platforms.map(p => p.engagementRate));
                    const percentage = maxEngagement > 0 ? (platform.engagementRate / maxEngagement) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex items-center">
                        <div className="w-20 md:w-28 text-sm text-gray-700 capitalize">{platform.platform}</div>
                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: getPlatformColor(platform.platform)
                            }}
                          />
                        </div>
                        <span className="ml-2 text-sm text-gray-700 font-medium">
                          {formatPercentage(platform.engagementRate)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Gender Distribution Comparison */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Gender Distribution</h3>
                <div className="space-y-3">
                  {platforms.map((platform, index) => (
                    <div key={index} className="flex flex-col">
                      <div className="flex items-center mb-2">
                        <div className="w-20 md:w-28 text-sm text-gray-700 capitalize">{platform.platform}</div>
                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden flex">
                          <div 
                            className="h-full bg-blue-500" 
                            style={{ width: `${platform.malePercent * 100}%` }}
                          />
                          <div 
                            className="h-full bg-pink-500" 
                            style={{ width: `${platform.femalePercent * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-center gap-6 text-sm">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                          <span>Male: {formatPercentage(platform.malePercent)}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-pink-500 rounded-full mr-1"></div>
                          <span>Female: {formatPercentage(platform.femalePercent)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p>
          <strong>Pro Tip:</strong> Different platforms can reach different demographic groups. 
          Consider focusing your pricing strategies on the platform that best reaches your target audience
          for each product.
        </p>
      </div>
    </div>
  );
} 