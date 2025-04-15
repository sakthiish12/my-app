'use client'; // Mark as client component for future interactions

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

// Helper to generate random string for state parameter
const generateState = () => {
  const array = new Uint32Array(8);
  window.crypto.getRandomValues(array);
  return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
};

export default function LinkedInPage() {
  const router = useRouter();
  const { user } = useUser();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [statusCheckCount, setStatusCheckCount] = useState(0);

  // Check connection status on load and after attempts
  useEffect(() => {
    let isMounted = true;
    
    const checkConnectionStatus = async () => {
      try {
        console.log("Checking LinkedIn connection status...");
        const response = await fetch('/api/user/linkedin-status');
        const data = await response.json();
        
        if (isMounted) {
          console.log("Connection status:", data);
          setIsConnected(data.isConnected);
          
          // If we're actively connecting and not yet connected, check again
          if (isConnecting && !data.isConnected && statusCheckCount < 5) {
            setStatusCheckCount(count => count + 1);
            setTimeout(checkConnectionStatus, 2000); // Check again in 2 seconds
          } else if (data.isConnected) {
            setIsConnecting(false);
          }
        }
      } catch (e) {
        console.error('Error checking LinkedIn status:', e);
        if (isMounted) {
          setIsConnecting(false);
        }
      }
    };

    checkConnectionStatus();
    
    // Message handler for popup communication
    const handleMessage = (event: MessageEvent) => {
      console.log("Received message:", event.data);
      
      if (event.data?.type === 'linkedin_oauth_success') {
        console.log('LinkedIn connection successful via message');
        setIsConnected(true);
        setIsConnecting(false);
        router.refresh();
      } else if (event.data?.type === 'linkedin_oauth_error') {
        setError(event.data.data?.error || 'Connection failed');
        setIsConnecting(false);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      isMounted = false;
      window.removeEventListener('message', handleMessage);
    };
  }, [router, isConnecting, statusCheckCount]);

  const handleConnectLinkedIn = () => {
    try {
      setIsConnecting(true);
      setStatusCheckCount(0);
      setError(null);

      const state = generateState();
      document.cookie = `linkedin_oauth_state=${state}; path=/; max-age=300; SameSite=Lax`;

      const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
      const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/linkedin/callback`;
      
      if (!clientId || !redirectUri) {
        throw new Error("LinkedIn configuration is missing. Please check your environment variables.");
      }

      const linkedInAuthUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
      linkedInAuthUrl.searchParams.append('response_type', 'code');
      linkedInAuthUrl.searchParams.append('client_id', clientId);
      linkedInAuthUrl.searchParams.append('redirect_uri', redirectUri);
      linkedInAuthUrl.searchParams.append('state', state);
      linkedInAuthUrl.searchParams.append('scope', 'openid profile email');

      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        linkedInAuthUrl.toString(),
        'linkedin-oauth',
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
      );

      if (!popup) {
        throw new Error("Popup was blocked. Please allow popups for this site.");
      }

      // Start checking connection status after a delay
      setTimeout(() => {
        if (popup) {
          // Check connection status more frequently
          const checkInterval = setInterval(() => {
            if (popup.closed) {
              // Popup was closed, clear interval
              clearInterval(checkInterval);
              
              // Poll the status API to see if connection was successful
              fetch('/api/user/linkedin-status')
                .then(res => res.json())
                .then(data => {
                  if (data.isConnected) {
                    setIsConnected(true);
                    setIsConnecting(false);
                  } else {
                    // Keep checking a few times after popup closes
                    setStatusCheckCount(1);
                  }
                })
                .catch(err => {
                  console.error('Error checking status after popup closed:', err);
                  setIsConnecting(false);
                });
            }
          }, 500);
        }
      }, 1000);

    } catch (e) {
      console.error('Error initiating LinkedIn connection:', e);
      setError(e instanceof Error ? e.message : 'Failed to connect to LinkedIn');
      setIsConnecting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">LinkedIn Profile Analysis</h1>
        <p className="text-gray-600">
          Connect your LinkedIn account to get pricing recommendations based on your audience.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {isConnected ? 'LinkedIn Connected' : 'Connect LinkedIn Account'}
        </h2>
        
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center text-green-600 mb-4">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Successfully connected to LinkedIn</span>
            </div>
            <p className="text-gray-600">
              Your LinkedIn profile is now connected. You can proceed to the next step.
            </p>
            <Link
              href="/dashboard"
              className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Continue to Dashboard
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-4">
              To analyze your LinkedIn audience and generate pricing insights, we need to connect to your LinkedIn account.
            </p>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}
            <button 
              className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              onClick={handleConnectLinkedIn}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </>
              ) : (
                'Connect with LinkedIn'
              )}
            </button>
          </>
        )}
      </div>

      <div className="flex justify-between">
        <Link
          href="/dashboard"
          className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
} 