'use client';

import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Demographics {
  totalFollowers: number;
  engagementRate: number;
  averageAge: number;
  topLocations: string[];
}

interface PricingCalculatorProps {
  userId: string;
}

export default function PricingCalculator({ userId }: PricingCalculatorProps) {
  const [loading, setLoading] = useState(true);
  const [basePrice, setBasePrice] = useState(100);
  const [multiplier, setMultiplier] = useState(1);
  const [demographics, setDemographics] = useState<Demographics | null>(null);

  useEffect(() => {
    const fetchDemographics = async () => {
      try {
        // TODO: Replace with actual API call
        const mockData: Demographics = {
          totalFollowers: 75000,
          engagementRate: 0.042,
          averageAge: 32,
          topLocations: ['United States', 'United Kingdom', 'Canada'],
        };
        
        setDemographics(mockData);
      } catch (error) {
        console.error('Error fetching demographics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDemographics();
  }, [userId]);

  const calculateRecommendedPrice = () => {
    if (!demographics) return basePrice;
    
    let price = basePrice;
    
    // Adjust for follower count
    if (demographics.totalFollowers > 100000) {
      price *= 2;
    } else if (demographics.totalFollowers > 50000) {
      price *= 1.5;
    }
    
    // Adjust for engagement rate
    if (demographics.engagementRate > 0.05) {
      price *= 1.3;
    }
    
    return price * multiplier;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Pricing Calculator</h3>
        {demographics && (
          <div className="text-sm text-gray-600 mb-4">
            Based on {demographics.totalFollowers.toLocaleString()} followers with {(demographics.engagementRate * 100).toFixed(1)}% engagement
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Base Price ($)</label>
          <input
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Price Multiplier</label>
          <input
            type="number"
            step="0.1"
            value={multiplier}
            onChange={(e) => setMultiplier(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div className="mt-6">
          <h4 className="text-lg font-medium">Recommended Price</h4>
          <p className="text-3xl font-bold text-indigo-600">
            ${calculateRecommendedPrice().toFixed(2)}
          </p>
          {demographics && (
            <p className="text-sm text-gray-500 mt-2">
              Price adjusted for audience size and engagement metrics
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 