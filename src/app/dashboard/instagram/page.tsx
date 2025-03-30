"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

interface InstagramFormData {
  appId: string;
  appSecret: string;
}

export default function InstagramPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InstagramFormData>();

  const validateCredentials = (appId: string, appSecret: string) => {
    // Basic validation for App ID format (usually numeric and at least 15 digits)
    if (!/^\d{15,}$/.test(appId)) {
      throw new Error('Invalid App ID format. Instagram App IDs are typically numeric and at least 15 digits long.');
    }

    // Basic validation for App Secret format (usually alphanumeric and at least 32 characters)
    if (!/^[a-zA-Z0-9]{32,}$/.test(appSecret)) {
      throw new Error('Invalid App Secret format. Instagram App Secrets are typically alphanumeric and at least 32 characters long.');
    }
  };

  const initiateOAuth = async (data: InstagramFormData) => {
    try {
      // Validate credentials format
      validateCredentials(data.appId, data.appSecret);

      // Store credentials in session storage for the callback
      sessionStorage.setItem('instagram_credentials', JSON.stringify(data));
      
      // Construct OAuth URL
      const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI || '');
      const scope = encodeURIComponent('user_profile,user_media,instagram_graph_user_profile,instagram_graph_user_media');
      const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${data.appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
      
      // Redirect to Instagram auth
      window.location.href = authUrl;
    } catch (err: any) {
      throw new Error(err.message || 'Invalid Instagram API credentials');
    }
  };

  const onSubmit = async (data: InstagramFormData) => {
    try {
      setIsSubmitting(true);
      setError('');
      
      await initiateOAuth(data);
      
    } catch (err: any) {
      setError(err.message || 'Failed to connect Instagram account');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Connect Your Instagram Account</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="appId" className="block text-sm font-medium text-gray-900 mb-1">
                App ID
              </label>
              <input
                id="appId"
                type="text"
                {...register("appId", { 
                  required: "App ID is required",
                  pattern: {
                    value: /^\d{15,}$/,
                    message: "Invalid App ID format. Instagram App IDs are typically numeric and at least 15 digits long."
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                placeholder="Enter your Instagram App ID"
              />
              {errors.appId && (
                <p className="mt-1 text-sm text-red-600">{errors.appId.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="appSecret" className="block text-sm font-medium text-gray-900 mb-1">
                App Secret
              </label>
              <input
                id="appSecret"
                type="password"
                {...register("appSecret", { 
                  required: "App Secret is required",
                  pattern: {
                    value: /^[a-zA-Z0-9]{32,}$/,
                    message: "Invalid App Secret format. Instagram App Secrets are typically alphanumeric and at least 32 characters long."
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                placeholder="Enter your Instagram App Secret"
              />
              {errors.appSecret && (
                <p className="mt-1 text-sm text-red-600">{errors.appSecret.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                <p className="font-medium">Error connecting Instagram account</p>
                <p className="text-sm mt-1">{error}</p>
                <p className="text-sm mt-2">
                  Please make sure you:
                  <ul className="list-disc list-inside mt-1">
                    <li>Have created an Instagram App in the Meta Developer Console</li>
                    <li>Have enabled the Instagram Basic Display API</li>
                    <li>Have added the correct OAuth redirect URI</li>
                    <li>Are using the correct App ID and App Secret</li>
                  </ul>
                </p>
                <Link 
                  href="https://developers.facebook.com/docs/instagram-basic-display-api/getting-started"
                  target="_blank"
                  className="text-red-700 hover:text-red-900 underline mt-2 inline-block"
                >
                  View Instagram API Setup Guide →
                </Link>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Connecting...' : 'Connect Instagram'}
            </button>
          </form>
          
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Before you connect</h3>
            <p className="text-gray-600 mb-4">To connect your Instagram account, you'll need:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>An Instagram Business or Creator account</li>
              <li>A Facebook Developer account</li>
              <li>A registered Facebook App with Instagram Basic Display API enabled</li>
              <li>Your App's OAuth redirect URI configured correctly</li>
            </ul>
            <div className="mt-4">
              <Link
                href="https://developers.facebook.com/docs/instagram-basic-display-api/getting-started"
                target="_blank"
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                View Setup Instructions →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 