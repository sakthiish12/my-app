'use client'; // Mark as client component for future interactions

import React, { useState, useEffect } from 'react';
import openai from 'openai';

// Helper to generate random string for state parameter
const generateState = () => Math.random().toString(36).substring(2, 15);

// Expanded dummy data with demographic details
const expandedDummyData = [
  { name: 'John Doe', title: 'Software Engineer', company: 'Tech Corp', location: 'San Francisco, CA', industry: 'Technology', experience: 5, age: 30, gender: 'Male', education: 'B.Sc. Computer Science', skills: ['JavaScript', 'React', 'Node.js'] },
  { name: 'Jane Smith', title: 'Product Manager', company: 'Innovate Ltd', location: 'New York, NY', industry: 'Technology', experience: 8, age: 35, gender: 'Female', education: 'MBA', skills: ['Product Management', 'Agile', 'Leadership'] },
  { name: 'Alice Johnson', title: 'UX Designer', company: 'Design Studio', location: 'Austin, TX', industry: 'Design', experience: 3, age: 28, gender: 'Female', education: 'B.A. Graphic Design', skills: ['UX Design', 'Adobe XD', 'Sketch'] },
  { name: 'Bob Brown', title: 'Data Scientist', company: 'DataWorks', location: 'Seattle, WA', industry: 'Data Science', experience: 6, age: 32, gender: 'Male', education: 'M.Sc. Data Science', skills: ['Python', 'Machine Learning', 'Data Analysis'] },
  { name: 'Carol White', title: 'Marketing Specialist', company: 'MarketPro', location: 'Chicago, IL', industry: 'Marketing', experience: 4, age: 29, gender: 'Female', education: 'B.A. Marketing', skills: ['SEO', 'Content Marketing', 'Social Media'] },
];

// Function to generate insights using OpenAI API
const generateInsights = async (data: any) => {
  try {
    const response = await openai.Completion.create({
      model: 'text-davinci-003',
      prompt: `Analyze the following LinkedIn data and provide insights: ${JSON.stringify(data)}`,
      max_tokens: 150,
    });
    return response.choices[0].text;
  } catch (error) {
    console.error('Error generating insights:', error);
    return 'Failed to generate insights.';
  }
};

export default function LinkedInPage() {
  // State for session cookie inputs
  const [sessionCookie, setSessionCookie] = useState('');
  const [profileUrl, setProfileUrl] = useState('');

  // State for API interaction
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeResults, setScrapeResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [scrapeMessage, setScrapeMessage] = useState<string | null>(null);

  // State for OAuth connection status
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false); // TODO: Check connection status on load
  const [isConnectingOAuth, setIsConnectingOAuth] = useState(false);

  // State for AI-generated insights
  const [aiInsights, setAiInsights] = useState<string | null>(null);

  // Use expanded dummy data for visualization
  useEffect(() => {
    setScrapeResults(expandedDummyData);
  }, []);

  useEffect(() => {
    const fetchInsights = async () => {
      const insights = await generateInsights(expandedDummyData);
      setAiInsights(insights);
    };
    fetchInsights();
  }, []);

  // --- OAuth Logic --- 
  const handleConnectLinkedInOAuth = () => {
    setIsConnectingOAuth(true);
    setError(null);
    const state = generateState();
    // Store state locally to verify callback AND SET COOKIE
    // localStorage.setItem('linkedin_oauth_state', state); // Local storage no longer needed for validation
    document.cookie = `linkedin_oauth_state=${state}; path=/; max-age=300; SameSite=Lax`; // Store state in a short-lived cookie

    const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/linkedin/callback`;
    // Standard OIDC scopes + LinkedIn specific ones
    const scope = 'openid profile email'; // Adjust scopes as needed

    if (!clientId || !redirectUri) {
       setError("LinkedIn client configuration missing. Please check environment variables.");
       setIsConnectingOAuth(false);
       return;
    }

    const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;

    // Open pop-up window
    const popupWidth = 600;
    const popupHeight = 700;
    const left = window.screenX + (window.outerWidth - popupWidth) / 2;
    const top = window.screenY + (window.outerHeight - popupHeight) / 2;
    const popup = window.open(
      linkedInAuthUrl,
      'linkedinLogin',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`
    );

    // Check if popup was blocked
    if (!popup) {
      setError('Pop-up window blocked. Please allow pop-ups for this site.');
      setIsConnectingOAuth(false);
      return;
    }

    // Optional: Add a timer to check if the popup is closed, 
    // in case postMessage fails or isn't implemented in callback
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        setIsConnectingOAuth(false);
        // Optionally check connection status again here
        console.log('LinkedIn pop-up closed.');
      }
    }, 1000);
  };

  // Listen for messages from the OAuth callback pop-up
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        console.warn('Received message from unexpected origin:', event.origin);
        return; 
      }

      if (event.data?.type === 'linkedin_oauth_success') {
        console.log('Received LinkedIn OAuth Success message');
        setIsLinkedInConnected(true);
        setError(null);
      } else if (event.data?.type === 'linkedin_oauth_error') {
        console.error('Received LinkedIn OAuth Error message:', event.data.error);
        setError(`LinkedIn connection failed: ${event.data.error || 'Unknown error'}`);
        setIsLinkedInConnected(false);
      }
      setIsConnectingOAuth(false);
    };

    window.addEventListener('message', handleMessage);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // TODO: Add useEffect to check initial connection status on page load
  // This would typically involve an API call to your backend
  // to see if valid LinkedIn tokens exist for the user.

  // --- Session Cookie Scrape Logic --- 
  const handleScrapeProfile = async () => {
    if (!sessionCookie || !profileUrl) {
      setError('Please provide both your LinkedIn session cookie and profile URL for this method.');
      return;
    }
    setIsScraping(true);
    setError(null);
    setScrapeResults(null);
    setScrapeMessage(null);
    console.log("Triggering PhantomBuster scrape using session cookie...");
    try {
       const response = await fetch('/api/linkedin/scrape', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({ sessionCookie, profileUrl }),
       });

       const data = await response.json();

       if (!response.ok) {
         throw new Error(data.error || `Request failed with status ${response.status}`);
       }

       // Display the message from the API (e.g., "Phantom launch initiated")
       setScrapeMessage(data.message || 'Scrape initiated successfully. Results will take time.');
       // Optionally store containerId if needed for polling: setContainerId(data.containerId);
       console.log('Scrape initiated:', data);
       // NOTE: Results are not immediate. Need polling or webhook implementation.

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error("Scraping error:", err);
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">LinkedIn Insights</h1>

       {/* Section 1: Connect via OAuth (Recommended) */} 
      <section className="mb-6 p-6 border border-blue-200 rounded-lg bg-white shadow-sm">
        <div className="flex justify-between items-start mb-3">
           <div>
             <h2 className="text-xl font-semibold text-blue-800">1a. Connect via LinkedIn (OAuth)</h2>
             <p className="text-gray-600 text-sm">Recommended & More Secure Method</p>
           </div>
           {isLinkedInConnected && (
             <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Connected</span>
           )}
        </div>
       
        {!isLinkedInConnected ? (
          <>
            <p className="text-gray-600 mb-4">
              Authorize SocioPrice to access basic profile information via LinkedIn's secure OAuth flow.
              We will store an access token to interact with LinkedIn APIs on your behalf (where applicable).
            </p>
            <button
              onClick={handleConnectLinkedInOAuth}
              disabled={isConnectingOAuth}
              className="px-5 py-2 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-wait transition duration-150 ease-in-out"
            >
              {isConnectingOAuth ? 'Connecting...' : 'Connect with LinkedIn'}
            </button>
          </>
        ) : (
          <p className="text-green-700 font-medium">Your LinkedIn account is connected!</p>
        )}
         {/* Display OAuth specific errors here */}
         {error && error.startsWith('LinkedIn connection failed') && <p className="mt-3 text-red-600 text-sm">Error: {error}</p>}
         {error && error.startsWith('Pop-up') && <p className="mt-3 text-red-600 text-sm">Error: {error}</p>}
         {error && error.startsWith('LinkedIn client configuration') && <p className="mt-3 text-red-600 text-sm">Error: {error}</p>}
      </section>

      {/* Section 1b: Provide LinkedIn Details (Session Cookie Method) */} 
      <section className="mb-6 p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-1">1b. Connect via Session Cookie</h2>
        <p className="text-gray-600 text-sm mb-3">Alternative method for direct PhantomBuster scraping (Requires `li_at` cookie)</p>
        
        {/* Security Warning */} 
        <div className="mb-4 p-4 border-l-4 border-red-500 bg-red-50 text-red-700 rounded-md">
          <h3 className="font-bold text-lg mb-1">Security Warning!</h3>
          <p className="text-sm">
            Your LinkedIn session cookie (`li_at`) grants temporary access to your account. 
            Handle it like a password and **never share it** with anyone untrusted.
            We only use it to initiate the scrape via PhantomBuster and do not store it long-term after the process begins.
            Ensure you are logged into LinkedIn in your browser to obtain the correct cookie.
          </p>
          {/* Optionally add a link to a guide on how to find the cookie */}
          {/* <a href="#" className="text-red-600 hover:underline text-sm mt-1 block">How to find your li_at cookie?</a> */}
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="profileUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Your LinkedIn Profile URL
            </label>
            <input
              type="url"
              id="profileUrl"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              placeholder="https://www.linkedin.com/in/your-profile-name/"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
             <label htmlFor="sessionCookie" className="block text-sm font-medium text-gray-700 mb-1">
               LinkedIn Session Cookie (`li_at`)
             </label>
             <input
               type="password" // Use password type to obscure the value
               id="sessionCookie"
               value={sessionCookie}
               onChange={(e) => setSessionCookie(e.target.value)}
               placeholder="Paste your li_at cookie here (starts with AQ...) "
               className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
               required
             />
          </div>
        </div>
      </section>

      {/* Section 2: Trigger Scrape */} 
      <section className="mb-6 p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-3">2. Fetch Follower Data (using Session Cookie)</h2>
        <p className="text-gray-600 mb-4">
           Use this if you provided your details in section 1b. Starts the PhantomBuster scrape using your `li_at` cookie.
        </p>
        <button
          onClick={handleScrapeProfile} // This still uses the session cookie method
          disabled={isScraping || !sessionCookie || !profileUrl}
          className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-md shadow-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
        >
          {isScraping ? 'Initiating Scrape...' : 'Fetch Data (Session Cookie)'}
        </button>
        {/* TODO: Add a separate button/logic for scraping if OAuth connection is used, */} 
        {/* as it might involve different API calls or Phantom configurations */} 
      </section>

      {/* Section 3: Display Results & Recommendations */} 
      <section className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-3">3. Insights & Recommendations</h2>
        {/* Display messages or errors from the scrape initiation */}
        {error && <p className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded-md">Error: {error}</p>}
        {scrapeMessage && <p className="mb-4 p-3 bg-blue-100 text-blue-700 border border-blue-200 rounded-md">{scrapeMessage}</p>}
        
        {isScraping && 
          <div className="flex items-center text-gray-600">
             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
             Processing request...
           </div>
        }
        
        {/* Placeholder for actual results - requires polling/webhooks */} 
        {!isScraping && !scrapeResults && !error && !scrapeMessage && (
           <p className="text-gray-500">Provide your details and fetch data to see insights here.</p>
        )}
        
        {/* Display Scrape Results in a Detailed Table */}
        {scrapeResults && (
          <section className="mb-6 p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-1">Scrape Results</h2>
            <table className="min-w-full bg-white border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border">Name</th>
                  <th className="py-2 px-4 border">Title</th>
                  <th className="py-2 px-4 border">Company</th>
                  <th className="py-2 px-4 border">Location</th>
                  <th className="py-2 px-4 border">Industry</th>
                  <th className="py-2 px-4 border">Experience (Years)</th>
                  <th className="py-2 px-4 border">Age</th>
                  <th className="py-2 px-4 border">Gender</th>
                  <th className="py-2 px-4 border">Education</th>
                  <th className="py-2 px-4 border">Skills</th>
                </tr>
              </thead>
              <tbody>
                {scrapeResults.map((result: { name: string; title: string; company: string; location: string; industry: string; experience: number; age: number; gender: string; education: string; skills: string[] }, index: number) => (
                  <tr key={index} className="text-center">
                    <td className="py-2 px-4 border">{result.name}</td>
                    <td className="py-2 px-4 border">{result.title}</td>
                    <td className="py-2 px-4 border">{result.company}</td>
                    <td className="py-2 px-4 border">{result.location}</td>
                    <td className="py-2 px-4 border">{result.industry}</td>
                    <td className="py-2 px-4 border">{result.experience}</td>
                    <td className="py-2 px-4 border">{result.age}</td>
                    <td className="py-2 px-4 border">{result.gender}</td>
                    <td className="py-2 px-4 border">{result.education}</td>
                    <td className="py-2 px-4 border">{result.skills.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Generate Detailed Statistics */}
        {scrapeResults && (
          <section className="mb-6 p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-1">Statistics</h2>
            <p>Total Followers: {scrapeResults.length}</p>
            <p>Average Experience: {(scrapeResults.reduce((acc: number, result: { experience: number }) => acc + result.experience, 0) / scrapeResults.length).toFixed(1)} years</p>
            <p>Gender Distribution: {scrapeResults.filter((result: { gender: string }) => result.gender === 'Male').length} Male, {scrapeResults.filter((result: { gender: string }) => result.gender === 'Female').length} Female</p>
            <p>Industries: {Array.from(new Set(scrapeResults.map((result: { industry: string }) => result.industry))).join(', ')}</p>
            <p>Locations: {Array.from(new Set(scrapeResults.map((result: { location: string }) => result.location))).join(', ')}</p>
            <p>Top Skills: {Array.from(new Set(scrapeResults.flatMap((result: { skills: string[] }) => result.skills))).join(', ')}</p>
          </section>
        )}

        {/* Display AI-Generated Insights */}
        {aiInsights && (
          <section className="mb-6 p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-1">AI-Generated Insights</h2>
            <p>{aiInsights}</p>
          </section>
        )}
      </section>
    </div>
  );
} 