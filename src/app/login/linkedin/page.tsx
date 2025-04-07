"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LinkedInLoginButton from '@/components/LinkedInLoginButton';

export default function LinkedInLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check for success/error parameters
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const oauthSuccess = searchParams.get('oauth') === 'success';
    
    if (errorParam) {
      setError(errorParam);
    }
    
    if (oauthSuccess) {
      setSuccess(true);
    }
  }, [searchParams]);

  const handleSuccess = () => {
    setSuccess(true);
    // After a short delay, redirect to the dashboard
    setTimeout(() => {
      router.push('/dashboard/linkedin?oauth=success');
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 max-w-md">
          <h2 className="text-red-800 font-bold">Login Error</h2>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => router.push('/dashboard/linkedin')} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      ) : success ? (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 max-w-md text-center">
          <h2 className="text-green-800 font-bold text-xl">Authentication Successful!</h2>
          <div className="my-4 text-3xl text-green-600">✓</div>
          <p className="text-green-700 mb-4">You have successfully connected with LinkedIn.</p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Sign in with LinkedIn</h2>
          <p className="text-gray-600 mb-6">Click the button below to sign in with your LinkedIn account.</p>
          
          <LinkedInLoginButton 
            buttonText="Sign in with LinkedIn" 
            className="px-6 py-3 text-base"
            onError={setError}
            onSuccess={handleSuccess}
          />
          
          <p className="mt-6 text-sm text-gray-500">
            This will open LinkedIn in a popup window to authenticate securely.
          </p>
        </div>
      )}
    </div>
  );
} 