"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function LinkedInPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/integrations/linkedin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: data.clientId,
          clientSecret: data.clientSecret,
          accessToken: data.accessToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to connect LinkedIn account');
      }

      setSuccess(true);
      
      // Optionally refresh the page data or update UI components
      // that depend on LinkedIn integration status
      
    } catch (error) {
      console.error("Error saving LinkedIn API keys:", error);
      setError(error instanceof Error ? error.message : 'Failed to connect LinkedIn account');
      setSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">LinkedIn Integration</h1>
        <p className="text-gray-800 text-lg">
          Connect your LinkedIn account to analyze your professional audience and get pricing recommendations.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">How to get LinkedIn API Credentials</h2>
        <ol className="list-decimal pl-5 space-y-3">
          <li>
            <span className="font-medium text-gray-900">Create a LinkedIn Developer Account</span>
            <p className="text-gray-800">Visit the <a href="https://www.linkedin.com/developers/" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900 underline">LinkedIn Developer Portal</a> and sign in with your LinkedIn account.</p>
          </li>
          <li>
            <span className="font-medium text-gray-900">Create a New App</span>
            <p className="text-gray-800">Click on "Create App" and fill in the required information about your application.</p>
          </li>
          <li>
            <span className="font-medium text-gray-900">Configure OAuth 2.0 Settings</span>
            <p className="text-gray-800">Add authorized redirect URLs for your application (e.g., http://localhost:3000/api/auth/callback/linkedin).</p>
          </li>
          <li>
            <span className="font-medium text-gray-900">Request Access to LinkedIn APIs</span>
            <p className="text-gray-800">In the "Products" tab, request access to the Marketing Developer Platform and other APIs you need.</p>
          </li>
          <li>
            <span className="font-medium text-gray-900">Get Your Credentials</span>
            <p className="text-gray-800">Once approved, you can find your Client ID and Client Secret in the "Auth" tab of your app.</p>
          </li>
        </ol>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Enter Your LinkedIn API Credentials</h2>
        
        {success ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
              <p className="font-medium">LinkedIn account successfully connected!</p>
              <p className="text-sm mt-1">You can now use your LinkedIn data for pricing analysis.</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSuccess(false)}
                className="text-purple-600 hover:text-purple-900 font-medium"
              >
                Update Credentials
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 font-medium transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-900 mb-1">
                Client ID
              </label>
              <input
                id="clientId"
                type="text"
                {...register("clientId", { required: "Client ID is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                placeholder="Enter your LinkedIn Client ID"
              />
              {errors.clientId && (
                <p className="mt-1 text-sm text-red-600">{errors.clientId.message as string}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="clientSecret" className="block text-sm font-medium text-gray-900 mb-1">
                Client Secret
              </label>
              <input
                id="clientSecret"
                type="password"
                {...register("clientSecret", { required: "Client Secret is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                placeholder="Enter your LinkedIn Client Secret"
              />
              {errors.clientSecret && (
                <p className="mt-1 text-sm text-red-600">{errors.clientSecret.message as string}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="accessToken" className="block text-sm font-medium text-gray-900 mb-1">
                Access Token (Optional)
              </label>
              <input
                id="accessToken"
                type="password"
                {...register("accessToken")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                placeholder="Enter your LinkedIn Access Token if you have one"
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                {...register("terms", { required: "You must agree to the terms" })}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-800">
                I understand that my API credentials will be stored securely and only used for the purposes of analyzing my LinkedIn audience.
              </label>
            </div>
            {errors.terms && (
              <p className="mt-1 text-sm text-red-600">{errors.terms.message as string}</p>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 px-4 ${
                isSubmitting ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'
              } text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 font-medium transition-colors`}
            >
              {isSubmitting ? 'Connecting...' : 'Connect LinkedIn Account'}
            </button>
          </form>
        )}
        
        <p className="text-sm text-gray-700 mt-4">
          Your credentials are stored securely and encrypted. We never share your data with third parties.
        </p>
      </div>
    </div>
  );
} 