"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function InstagramPage() {
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
      console.error("Error saving Instagram API keys:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Instagram Integration</h1>
        <p className="text-gray-800 text-lg">
          Connect your Instagram account to analyze your audience and get pricing recommendations for your content.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">How to get Instagram API Credentials</h2>
        <ol className="list-decimal pl-5 space-y-3">
          <li>
            <span className="font-medium text-gray-900">Create a Facebook Developer Account</span>
            <p className="text-gray-800">Visit the <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:text-purple-900 underline">Facebook for Developers</a> portal and sign in with your Facebook account.</p>
          </li>
          <li>
            <span className="font-medium text-gray-900">Create a Facebook App</span>
            <p className="text-gray-800">Click on "Create App" and select "Business" as the app type. Fill in the required information.</p>
          </li>
          <li>
            <span className="font-medium text-gray-900">Add Instagram Graph API</span>
            <p className="text-gray-800">In your app dashboard, click on "Add Products" and select "Instagram Graph API".</p>
          </li>
          <li>
            <span className="font-medium text-gray-900">Configure Basic Settings</span>
            <p className="text-gray-800">In the app settings, provide the necessary information including privacy policy URL and app domain.</p>
          </li>
          <li>
            <span className="font-medium text-gray-900">Connect Instagram Account</span>
            <p className="text-gray-800">In the Instagram Graph API settings, connect your Instagram Business or Creator account to your Facebook app.</p>
          </li>
          <li>
            <span className="font-medium text-gray-900">Generate Access Token</span>
            <p className="text-gray-800">Generate a long-lived access token for your app and Instagram account. This token will be used to authenticate API requests.</p>
          </li>
        </ol>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Enter Your Instagram API Credentials</h2>
        
        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-4">
            Instagram account successfully connected! You can now use your Instagram data for pricing analysis.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="appId" className="block text-sm font-medium text-gray-900 mb-1">
                App ID
              </label>
              <input
                id="appId"
                type="text"
                {...register("appId", { required: "App ID is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                placeholder="Enter your Facebook App ID"
              />
              {errors.appId && (
                <p className="mt-1 text-sm text-red-600">{errors.appId.message as string}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="appSecret" className="block text-sm font-medium text-gray-900 mb-1">
                App Secret
              </label>
              <input
                id="appSecret"
                type="password"
                {...register("appSecret", { required: "App Secret is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                placeholder="Enter your Facebook App Secret"
              />
              {errors.appSecret && (
                <p className="mt-1 text-sm text-red-600">{errors.appSecret.message as string}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="accessToken" className="block text-sm font-medium text-gray-900 mb-1">
                Instagram Access Token
              </label>
              <input
                id="accessToken"
                type="password"
                {...register("accessToken", { required: "Access Token is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                placeholder="Enter your Instagram Access Token"
              />
              {errors.accessToken && (
                <p className="mt-1 text-sm text-red-600">{errors.accessToken.message as string}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="instagramAccountId" className="block text-sm font-medium text-gray-900 mb-1">
                Instagram Business Account ID
              </label>
              <input
                id="instagramAccountId"
                type="text"
                {...register("instagramAccountId", { required: "Instagram Account ID is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                placeholder="Enter your Instagram Business Account ID"
              />
              {errors.instagramAccountId && (
                <p className="mt-1 text-sm text-red-600">{errors.instagramAccountId.message as string}</p>
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
                I understand that my API credentials will be stored securely and only used for the purposes of analyzing my Instagram audience.
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
              {isSubmitting ? 'Connecting...' : 'Connect Instagram Account'}
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