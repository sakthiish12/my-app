"use client";

import { useState } from 'react';
import { createPortalSession } from '@/lib/stripe';

export default function SubscriptionManager({ subscription }: { subscription: any }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      await createPortalSession();
    } catch (error) {
      console.error('Error managing subscription:', error);
      // You might want to show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Subscription Status</h2>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">Current Plan</span>
          <span className="font-medium text-gray-900 capitalize">{subscription?.plan || 'No active plan'}</span>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">Billing Period</span>
          <span className="font-medium text-gray-900">{subscription?.interval || 'N/A'}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Next Payment</span>
          <span className="font-medium text-gray-900">
            {subscription?.nextPayment
              ? new Date(subscription.nextPayment).toLocaleDateString()
              : 'N/A'}
          </span>
        </div>
      </div>
      
      <button
        onClick={handleManageSubscription}
        disabled={isLoading}
        className={`w-full py-2 px-4 ${
          isLoading ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'
        } text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 font-medium transition-colors`}
      >
        {isLoading ? 'Loading...' : 'Manage Subscription'}
      </button>
      
      <p className="text-sm text-gray-500 mt-4">
        Manage your subscription, update payment method, or change your plan.
      </p>
    </div>
  );
} 