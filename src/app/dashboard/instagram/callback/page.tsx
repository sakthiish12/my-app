'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function InstagramCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processOAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        
        if (error) {
          throw new Error(error);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Get stored credentials
        const storedCredentials = sessionStorage.getItem('instagram_credentials');
        if (!storedCredentials) {
          throw new Error('No credentials found');
        }

        const { appId, appSecret } = JSON.parse(storedCredentials);

        // Clear stored credentials
        sessionStorage.removeItem('instagram_credentials');

        // Exchange code for access token
        const response = await fetch('/api/social/instagram', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appId,
            appSecret,
            code,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to connect Instagram account');
        }

        // Redirect to dashboard on success
        router.push('/dashboard?instagram=connected');

      } catch (err: any) {
        console.error('Error processing Instagram callback:', err);
        setError(err.message || 'An error occurred while connecting your Instagram account');
      } finally {
        setIsProcessing(false);
      }
    };

    processOAuthCallback();
  }, [router, searchParams]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Connecting your Instagram account...</h2>
            <p className="mt-2 text-gray-600">Please wait while we process your request.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Connection Failed</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              onClick={() => router.push('/dashboard/instagram')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 