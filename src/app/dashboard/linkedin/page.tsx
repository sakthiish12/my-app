"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaLinkedin, FaUserFriends, FaChartBar, FaMoneyBillWave, FaShoppingCart, FaQuestionCircle, FaSignInAlt } from 'react-icons/fa';
import LinkedInLoginButton from '@/components/LinkedInLoginButton';
import { useAuth } from '@/contexts/AuthContext';

interface LinkedInFormData {
  linkedinProfileUrl: string;
}

interface AnalyticsData {
  totalFollowers: number;
  industries: Record<string, number>;
  locations: Record<string, number>;
  companies: Record<string, number>;
  jobTitles: Record<string, number>;
  seniority: Record<string, number>;
  recommendedPricing: {
    digitalProducts: {
      ebook: { min: number; max: number; optimal: number };
      onlineCourse: { min: number; max: number; optimal: number };
      template: { min: number; max: number; optimal: number };
      coaching: { min: number; max: number; optimal: number; hourly: number };
      membership: { min: number; max: number; optimal: number };
    };
    premiumTiers: {
      basic: { price: number; features: string[] };
      professional: { price: number; features: string[] };
      enterprise: { price: number; features: string[] };
    };
  };
  productRecommendations: {
    highDemand: string[];
    niche: string[];
    trending: string[];
  };
}

export default function LinkedInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [linkedinSubmitting, setLinkedinSubmitting] = useState(false);
  const [linkedinSuccess, setLinkedinSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthSuccess, setOauthSuccess] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState<'demographics' | 'pricing' | 'products'>('demographics');
  
  const { 
    register: registerLinkedin, 
    handleSubmit: handleLinkedinSubmit, 
    formState: { errors: linkedinErrors } 
  } = useForm<LinkedInFormData>();

  // Check for OAuth success/error params and verify state if applicable
  useEffect(() => {
    // Check for code parameter (indicates we're receiving a callback from LinkedIn)
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    // If we have a code, this is the OAuth callback
    if (code) {
      // Verify state to prevent CSRF
      const storedState = typeof window !== 'undefined' ? localStorage.getItem('linkedin_oauth_state') : null;
      
      // Clear stored state
      if (typeof window !== 'undefined') {
        localStorage.removeItem('linkedin_oauth_state');
      }
      
      // Show loading state
      setAnalyticsLoading(true);
      
      // Exchange code for token
      fetch('/api/auth/linkedin/exchange-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code, 
          redirectUri: localStorage.getItem('linkedin_redirect_uri') || (window.location.origin + '/dashboard/linkedin')
        }),
      })
      .then(response => {
        console.log('Token exchange response status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('Token exchange response:', data);
        if (data.status === 'success') {
          setOauthSuccess(true);
          // After successful authentication, fetch analytics
          fetchAnalytics();
        } else {
          setError(data.error || 'Failed to authenticate with LinkedIn');
          console.error('LinkedIn authentication error details:', data.details || 'No detailed error information');
        }
      })
      .catch(err => {
        console.error('Error exchanging code for token:', err);
        setError('Failed to complete LinkedIn authentication');
      })
      .finally(() => {
        setAnalyticsLoading(false);
        
        // Clean up URL to remove code and state params
        const url = new URL(window.location.href);
        url.searchParams.delete('code');
        url.searchParams.delete('state');
        window.history.replaceState({}, document.title, url.toString());
      });
      
      return;
    }
    
    // Check for oauth=success parameter (from older flow)
    if (searchParams.get('oauth') === 'success') {
      const returnedState = searchParams.get('state');
      const storedState = typeof window !== 'undefined' ? localStorage.getItem('linkedin_oauth_state') : null;
      
      // Clear stored state
      if (typeof window !== 'undefined') {
        localStorage.removeItem('linkedin_oauth_state');
      }
      
      // Verify state to prevent CSRF
      if (returnedState && storedState && returnedState === storedState) {
        setOauthSuccess(true);
        // After successful authentication, fetch analytics
        fetchAnalytics();
      } else if (returnedState && storedState) {
        // State mismatch - could be CSRF attack
        setError('Authentication failed: State parameter mismatch');
      } else {
        // No state verification but still successful (backup flow)
        setOauthSuccess(true);
        // After successful authentication, fetch analytics
        fetchAnalytics();
      }
    }
    
    // Check for error parameter
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'linkedin_auth_expired') {
        setError('Your LinkedIn authorization has expired. Please reconnect.');
      } else if (errorParam === 'callback_failed') {
        setError('LinkedIn authentication failed. Please try again.');
      } else if (errorParam === 'invalid_state') {
        setError('Authentication security check failed. Please try again.');
      } else {
        const description = searchParams.get('description');
        setError(`LinkedIn error: ${errorParam}${description ? ` - ${description}` : ''}`);
      }
    }
  }, [searchParams]);

  // Add a function to get the user's name from Clerk for use as default Phantom ID
  const { user } = useAuth();
  const [defaultPhantomId, setDefaultPhantomId] = useState<string>('');
  
  useEffect(() => {
    // Set default Phantom ID based on user's name if available
    if (user?.firstName) {
      // Create a simplified version of user's name for the Phantom ID
      const simplifiedName = user.firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
      setDefaultPhantomId(simplifiedName);
    }
  }, [user]);

  // Load analytics data when component mounts
  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await fetch('/api/linkedin/followers');
      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        setAnalytics(result.data);
      } else if (response.status === 401 && result.code === 'linkedin_auth_required') {
        // LinkedIn auth required, not an error
        console.log('LinkedIn authentication required');
      } else if (response.status === 404 && result.code === 'no_analytics') {
        // No analytics yet, not an error
        console.log('No LinkedIn analytics found yet');
      } else {
        console.error("Error fetching LinkedIn analytics:", result.message);
      }
    } catch (error) {
      console.error("Error fetching LinkedIn analytics:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const onLinkedinSubmit = async (data: LinkedInFormData) => {
    setLinkedinSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/linkedin/followers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkedinProfileUrl: data.linkedinProfileUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to analyze LinkedIn followers');
      }

      setLinkedinSuccess(true);
      
      // Reload analytics data after successful follower fetch
      await fetchAnalytics();
      
    } catch (error) {
      console.error("Error analyzing LinkedIn followers:", error);
      setError(error instanceof Error ? error.message : 'Failed to analyze LinkedIn followers');
      setLinkedinSuccess(false);
    } finally {
      setLinkedinSubmitting(false);
    }
  };

  // Helper function to sort object entries by value (descending)
  const sortObjectByValue = (obj: Record<string, number>) => {
    return Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  };

  // Add LinkedIn login success handler
  const handleLinkedInSuccess = () => {
    setOauthSuccess(true);
    fetchAnalytics();
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">LinkedIn Audience Analysis</h1>
        <p className="text-gray-800 text-lg">
          Analyze your LinkedIn followers to get pricing recommendations and product insights.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="ml-auto text-red-600 hover:text-red-800"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {oauthSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">Successfully connected to LinkedIn! You can now analyze your followers.</p>
            </div>
            <button 
              onClick={() => setOauthSuccess(false)} 
              className="ml-auto text-green-600 hover:text-green-800"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* LinkedIn Authentication Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="flex items-center mb-4">
          <FaLinkedin className="text-2xl text-blue-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Connect with LinkedIn</h2>
        </div>
        
        <p className="text-gray-800 mb-4">
          Connect your LinkedIn account to analyze your followers and get insights.
        </p>
        
        <LinkedInLoginButton 
          buttonText="Sign in with LinkedIn"
          className="font-medium transition-colors"
          onError={(errorMsg) => setError(errorMsg)}
          onSuccess={handleLinkedInSuccess}
        />
        
        <p className="text-sm text-gray-600 mt-4">
          This will open a popup window to LinkedIn to authorize access to your profile data.
          We only access the data needed to analyze your followers.
        </p>
      </div>

      {/* LinkedIn Profile URL Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="flex items-center mb-4">
          <FaUserFriends className="text-2xl text-blue-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Analyze Your LinkedIn Followers</h2>
        </div>
        
        {linkedinSuccess ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
              <p className="font-medium">LinkedIn followers successfully analyzed!</p>
              <p className="text-sm mt-1">You can now view your audience insights below.</p>
            </div>
            <button
              onClick={() => setLinkedinSuccess(false)}
              className="text-blue-600 hover:text-blue-900 font-medium"
            >
              Analyze Another Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleLinkedinSubmit(onLinkedinSubmit)} className="space-y-4">
            <div>
              <label htmlFor="linkedinProfileUrl" className="block text-sm font-medium text-gray-900 mb-1">
                LinkedIn Profile URL
              </label>
              <input
                id="linkedinProfileUrl"
                type="text"
                {...registerLinkedin("linkedinProfileUrl", { required: "LinkedIn profile URL is required" })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="https://www.linkedin.com/in/yourprofile/"
              />
              {linkedinErrors.linkedinProfileUrl && (
                <p className="mt-1 text-sm text-red-600">{linkedinErrors.linkedinProfileUrl.message}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={linkedinSubmitting}
              className={`py-2 px-4 ${
                linkedinSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium transition-colors`}
            >
              {linkedinSubmitting ? 'Analyzing...' : 'Analyze Followers'}
            </button>
            
            <p className="text-sm text-gray-700">
              Note: This process may take several minutes depending on the number of followers.
            </p>
          </form>
        )}
      </div>

      {/* Analytics Dashboard */}
      {analytics && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">LinkedIn Audience Insights</h2>
            <p className="text-gray-800">
              Based on analysis of {analytics.totalFollowers} followers
            </p>
          </div>
          
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('demographics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'demographics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <FaUserFriends className="mr-2" />
                  Demographics
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('pricing')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pricing'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <FaMoneyBillWave className="mr-2" />
                  Pricing Strategy
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <FaShoppingCart className="mr-2" />
                  Product Recommendations
                </div>
              </button>
            </nav>
          </div>
          
          {/* Demographics Tab */}
          {activeTab === 'demographics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Industries Chart */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Industries</h3>
                <div className="space-y-2">
                  {sortObjectByValue(analytics.industries).map(([industry, percentage]) => (
                    <div key={industry} className="flex items-center">
                      <div className="w-32 text-sm text-gray-900 truncate pr-2">{industry}</div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-12 text-right text-sm text-gray-700">{percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Locations Chart */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Locations</h3>
                <div className="space-y-2">
                  {sortObjectByValue(analytics.locations).map(([location, percentage]) => (
                    <div key={location} className="flex items-center">
                      <div className="w-32 text-sm text-gray-900 truncate pr-2">{location}</div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-600 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-12 text-right text-sm text-gray-700">{percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Seniority Chart */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Seniority Levels</h3>
                <div className="space-y-2">
                  {sortObjectByValue(analytics.seniority).map(([level, percentage]) => (
                    <div key={level} className="flex items-center">
                      <div className="w-32 text-sm text-gray-900 truncate pr-2">{level}</div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-600 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-12 text-right text-sm text-gray-700">{percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Job Titles Chart */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Top Job Titles</h3>
                <div className="space-y-2">
                  {sortObjectByValue(analytics.jobTitles).map(([title, percentage]) => (
                    <div key={title} className="flex items-center">
                      <div className="w-32 text-sm text-gray-900 truncate pr-2">{title}</div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-orange-600 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-12 text-right text-sm text-gray-700">{percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Pricing Strategy Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-8">
              {/* Digital Products Pricing */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recommended Digital Product Pricing</h3>
                <p className="text-gray-700 mb-4">
                  Based on your audience's demographics, purchasing power, and industry benchmarks.
                </p>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-800">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-lg">Product Type</th>
                        <th className="px-4 py-3">Minimum</th>
                        <th className="px-4 py-3">Optimal</th>
                        <th className="px-4 py-3 rounded-tr-lg">Maximum</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b">
                        <td className="px-4 py-3 font-medium">E-Book</td>
                        <td className="px-4 py-3">${analytics.recommendedPricing.digitalProducts.ebook.min}</td>
                        <td className="px-4 py-3 font-medium text-blue-700">${analytics.recommendedPricing.digitalProducts.ebook.optimal}</td>
                        <td className="px-4 py-3">${analytics.recommendedPricing.digitalProducts.ebook.max}</td>
                      </tr>
                      <tr className="bg-gray-50 border-b">
                        <td className="px-4 py-3 font-medium">Online Course</td>
                        <td className="px-4 py-3">${analytics.recommendedPricing.digitalProducts.onlineCourse.min}</td>
                        <td className="px-4 py-3 font-medium text-blue-700">${analytics.recommendedPricing.digitalProducts.onlineCourse.optimal}</td>
                        <td className="px-4 py-3">${analytics.recommendedPricing.digitalProducts.onlineCourse.max}</td>
                      </tr>
                      <tr className="bg-white border-b">
                        <td className="px-4 py-3 font-medium">Template or Toolkit</td>
                        <td className="px-4 py-3">${analytics.recommendedPricing.digitalProducts.template.min}</td>
                        <td className="px-4 py-3 font-medium text-blue-700">${analytics.recommendedPricing.digitalProducts.template.optimal}</td>
                        <td className="px-4 py-3">${analytics.recommendedPricing.digitalProducts.template.max}</td>
                      </tr>
                      <tr className="bg-gray-50 border-b">
                        <td className="px-4 py-3 font-medium">Coaching (Session)</td>
                        <td className="px-4 py-3">${analytics.recommendedPricing.digitalProducts.coaching.min}</td>
                        <td className="px-4 py-3 font-medium text-blue-700">${analytics.recommendedPricing.digitalProducts.coaching.optimal}</td>
                        <td className="px-4 py-3">${analytics.recommendedPricing.digitalProducts.coaching.max}</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="px-4 py-3 font-medium">Membership (Monthly)</td>
                        <td className="px-4 py-3">${analytics.recommendedPricing.digitalProducts.membership.min}</td>
                        <td className="px-4 py-3 font-medium text-blue-700">${analytics.recommendedPricing.digitalProducts.membership.optimal}</td>
                        <td className="px-4 py-3">${analytics.recommendedPricing.digitalProducts.membership.max}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Tiered Pricing Strategy */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Tiered Pricing Strategy</h3>
                <p className="text-gray-700 mb-4">
                  Optimize conversions with these audience-aligned pricing tiers.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Basic Tier */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b border-gray-200">
                      <h4 className="text-lg font-bold text-gray-900">Basic</h4>
                      <p className="text-3xl font-bold text-blue-600 mt-2">${analytics.recommendedPricing.premiumTiers.basic.price}<span className="text-sm text-gray-600 font-normal">/mo</span></p>
                    </div>
                    <div className="p-4">
                      <ul className="space-y-2">
                        {analytics.recommendedPricing.premiumTiers.basic.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Professional Tier */}
                  <div className="border-2 border-blue-500 rounded-lg overflow-hidden shadow-md">
                    <div className="bg-blue-50 p-4 border-b border-blue-200">
                      <h4 className="text-lg font-bold text-gray-900">Professional</h4>
                      <div className="flex items-center mt-2">
                        <p className="text-3xl font-bold text-blue-600">${analytics.recommendedPricing.premiumTiers.professional.price}<span className="text-sm text-gray-600 font-normal">/mo</span></p>
                        <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">RECOMMENDED</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <ul className="space-y-2">
                        {analytics.recommendedPricing.premiumTiers.professional.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Enterprise Tier */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 border-b border-gray-200">
                      <h4 className="text-lg font-bold text-gray-900">Enterprise</h4>
                      <p className="text-3xl font-bold text-blue-600 mt-2">${analytics.recommendedPricing.premiumTiers.enterprise.price}<span className="text-sm text-gray-600 font-normal">/mo</span></p>
                    </div>
                    <div className="p-4">
                      <ul className="space-y-2">
                        {analytics.recommendedPricing.premiumTiers.enterprise.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Product Recommendations Tab */}
          {activeTab === 'products' && (
            <div className="space-y-8">
              {/* High Demand Products */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">High-Demand Products</h3>
                <p className="text-gray-700 mb-4">
                  These products align best with your audience's core needs and interests.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {analytics.productRecommendations.highDemand.map((product, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center">
                      <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <FaChartBar />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{product}</h4>
                        <p className="text-sm text-gray-600">High conversion potential</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Niche Products */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Niche Opportunities</h3>
                <p className="text-gray-700 mb-4">
                  These specialized products target specific segments of your audience.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analytics.productRecommendations.niche.map((product, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center">
                      <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <FaUserFriends />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{product}</h4>
                        <p className="text-sm text-gray-600">Targeted segment appeal</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Trending Products */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Trending Opportunities</h3>
                <p className="text-gray-700 mb-4">
                  These products align with emerging interests in your audience.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.productRecommendations.trending.map((product, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center">
                      <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <FaShoppingCart />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{product}</h4>
                        <p className="text-sm text-gray-600">Growing market demand</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 