'use client';

import { useState } from 'react';
import { scrapeLinkedInProfile, scrapeLinkedInFollowers } from '@/lib/apify';
import { extractLinkedInCookies, storeLinkedInCookies, getStoredLinkedInCookies } from '@/lib/linkedinCookies';

interface AnalysisResult {
  profileData?: any;
  followerData?: any;
}

// LinkedIn profile component for audience analysis via URL input
export default function LinkedInProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [profileUrl, setProfileUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const validateLinkedInUrl = (url: string) => {
    // Basic validation for LinkedIn URLs
    const linkedInPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;
    return linkedInPattern.test(url);
  };

  const handleExtractCookies = async () => {
    setIsExtracting(true);
    setStatus(null);
    
    try {
      const cookies = await extractLinkedInCookies();
      storeLinkedInCookies(cookies);
      setStatus({
        success: true,
        message: 'Successfully logged in to LinkedIn'
      });
    } catch (error) {
      console.error('Cookie extraction error:', error);
      setStatus({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to extract LinkedIn cookies'
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAnalyzeProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);
    setAnalysisResult(null);
    
    try {
      // Validate the LinkedIn URL format
      if (!validateLinkedInUrl(profileUrl)) {
        throw new Error('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)');
      }

      // Get stored cookies or extract new ones
      let cookies = getStoredLinkedInCookies();
      if (!cookies) {
        setStatus({
          success: false,
          message: 'Please log in to LinkedIn first'
        });
        setIsLoading(false);
        return;
      }

      // First, get the profile data
      const profileResult = await scrapeLinkedInProfile({
        linkedInCookies: cookies,
        searchUrls: [profileUrl]
      });

      if (!profileResult.success) {
        throw new Error(profileResult.error);
      }

      // Then, get the followers data
      const followersResult = await scrapeLinkedInFollowers(profileUrl);
      
      if (!followersResult.success) {
        throw new Error(followersResult.error);
      }

      setAnalysisResult({
        profileData: profileResult.data,
        followerData: followersResult.data
      });

      setStatus({
        success: true,
        message: `Successfully analyzed "${profileUrl}" and its followers`
      });
      
    } catch (error) {
      console.error('LinkedIn profile error:', error);
      setStatus({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to analyze LinkedIn profile'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold">LinkedIn Profile & Follower Analysis</h2>
          <p className="text-gray-600">Analyze follower demographics and engagement patterns for pricing optimization</p>
        </div>
      </div>
      
      {status && (
        <div className={`p-4 rounded-lg mb-6 ${status.success ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-start space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mt-0.5 flex-shrink-0 ${status.success ? 'text-green-600' : 'text-red-600'}`} viewBox="0 0 20 20" fill="currentColor">
              {status.success ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              )}
            </svg>
            <p className={`text-sm ${status.success ? 'text-green-700' : 'text-red-700'}`}>
              {status.message}
            </p>
          </div>
        </div>
      )}
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <div className="flex items-start space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm text-blue-700">
              Our system analyzes both your LinkedIn profile and follower demographics to provide accurate pricing recommendations. We'll examine follower locations, industries, and engagement patterns.
            </p>
            <p className="text-sm text-blue-700 mt-2 font-medium">
              We only analyze public data and never store your credentials.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <button
          type="button"
          onClick={handleExtractCookies}
          className="w-full px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-70 mb-4"
          disabled={isExtracting}
        >
          {isExtracting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging in to LinkedIn...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
              </svg>
              Log in to LinkedIn
            </>
          )}
        </button>
      </div>
      
      <form onSubmit={handleAnalyzeProfile}>
        <div className="mb-4">
          <label htmlFor="profileUrl" className="block text-sm font-medium text-gray-700 mb-1">
            LinkedIn Profile URL
          </label>
          <input
            type="text"
            id="profileUrl"
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
            placeholder="https://linkedin.com/in/yourprofile"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Example: https://linkedin.com/in/johndoe
          </p>
        </div>
        
        <button 
          type="submit"
          className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-70"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing Profile & Followers...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              Analyze Profile & Followers
            </>
          )}
        </button>
      </form>

      {analysisResult && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Analysis Results</h3>
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(analysisResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 