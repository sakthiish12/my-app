'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, useUser } from '@clerk/nextjs';
import SocialConnectPanel from '../../../components/SocialConnectPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/Tabs';
import DemographicOverview from '../../../components/DemographicOverview';
import PlatformComparison from '../../../components/PlatformComparison';
import PricingRecommendations from '../../../components/PricingRecommendations';
import axios from 'axios';

export default function SocialsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [socialAccounts, setSocialAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (isLoaded && !user) {
      router.push('/sign-in');
      return;
    }

    // Fetch connected social accounts
    if (user) {
      fetchSocialAccounts();
    }
  }, [user, isLoaded, router]);

  const fetchSocialAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get('/api/social/accounts');
      
      if (response.status === 200) {
        setSocialAccounts(response.data.accounts || []);
      }
    } catch (err: any) {
      console.error('Error fetching social accounts:', err);
      setError(err.response?.data?.error || 'Failed to fetch connected accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountConnected = (platform: string, data: any) => {
    // Refresh the accounts list after a successful connection
    fetchSocialAccounts();
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Social Media Analytics</h1>
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {socialAccounts.length === 0 ? (
        <div className="mb-8">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-medium text-purple-800 mb-2">Get Started with Social Media Analytics</h2>
            <p className="text-purple-700">
              Connect your social media accounts to analyze your follower demographics and get optimal pricing recommendations.
            </p>
          </div>
          
          <SocialConnectPanel onAccountConnected={handleAccountConnected} />
        </div>
      ) : (
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="platforms">Platform Comparison</TabsTrigger>
              <TabsTrigger value="pricing">Pricing Recommendations</TabsTrigger>
              <TabsTrigger value="connect">Connect Accounts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <DemographicOverview accounts={socialAccounts} />
            </TabsContent>
            
            <TabsContent value="platforms" className="space-y-6">
              <PlatformComparison accounts={socialAccounts} />
            </TabsContent>
            
            <TabsContent value="pricing" className="space-y-6">
              <PricingRecommendations accounts={socialAccounts} />
            </TabsContent>
            
            <TabsContent value="connect" className="space-y-6">
              <SocialConnectPanel onAccountConnected={handleAccountConnected} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
} 