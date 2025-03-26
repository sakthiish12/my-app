"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function TikTokPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Here you would make an API call to your backend to store the API keys
      // For demo purposes, we're just simulating success
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
    } catch (error) {
      console.error("Error saving TikTok API keys:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">TikTok Integration</h1>
        <p className="text-gray-800 text-lg">
          Connect your TikTok account to analyze your audience and get pricing recommendations for your content.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">How to get TikTok API Credentials</h2>
        <ol className="list-decimal pl-5 space-y-3">
          <li>
            <span className="font-medium text-gray-900">Create a TikTok Developer Account</span>
            <p className="text-gray-800">Visit the <a href="https://developers.tiktok.com/" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900 underline">TikTok for Developers</a> portal and sign in with your TikTok account.</p>
          </li>
          <li>
            <span className="font-medium text-gray-900">Create a TikTok App</span>
            <p className="text-gray-800">Click on "Create App" and select "Business" as the app type. Fill in the required information.</p>
          </li>
          <li>
            <span className="font-medium text-gray-900">Configure App Settings</span>
            <p className="text-gray-800">In your app dashboard, provide the necessary information including privacy policy URL and app domain.</p>
          </li>
          <li>
            <span className="font-medium text-gray-900">Get API Credentials</span>
            <p className="text-gray-800">Once your app is approved, you'll receive your Client Key and Client Secret.</p>
          </li>
          <li>
            <span className="font-medium text-gray-900">Set Permissions</span>
            <p className="text-gray-800">Configure the required permissions for your app to access user data and analytics.</p>
          </li>
        </ol>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Enter Your TikTok API Credentials</h2>
        
        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-4">
            TikTok account successfully connected! You can now use your TikTok data for pricing analysis.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="clientKey" className="block text-sm font-medium text-gray-900 mb-1">
                Client Key
              </label>
              <input
                id="clientKey"
                type="text"
                {...register("clientKey", { required: "Client Key is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                placeholder="Enter your TikTok Client Key"
              />
              {errors.clientKey && (
                <p className="mt-1 text-sm text-red-600">{errors.clientKey.message as string}</p>
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
                placeholder="Enter your TikTok Client Secret"
              />
              {errors.clientSecret && (
                <p className="mt-1 text-sm text-red-600">{errors.clientSecret.message as string}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="accessToken" className="block text-sm font-medium text-gray-900 mb-1">
                Access Token
              </label>
              <input
                id="accessToken"
                type="password"
                {...register("accessToken", { required: "Access Token is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                placeholder="Enter your TikTok Access Token"
              />
              {errors.accessToken && (
                <p className="mt-1 text-sm text-red-600">{errors.accessToken.message as string}</p>
              )}
            </div>
            
            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                {...register("terms", { required: "You must agree to the terms" })}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-800">
                I understand that my API credentials will be stored securely and only used for the purposes of analyzing my TikTok audience.
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
              {isSubmitting ? 'Connecting...' : 'Connect TikTok Account'}
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