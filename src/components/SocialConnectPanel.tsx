import React, { useState } from 'react';
import AuthService from '../services/AuthService';

interface SocialConnectPanelProps {
  onAccountConnected: (platform: string, data: any) => void;
}

interface PlatformConfig {
  name: string;
  icon: string;
  color: string;
  isAvailable: boolean;
  connectHint?: string;
}

const PLATFORMS: Record<string, PlatformConfig> = {
  instagram: {
    name: 'Instagram',
    icon: 'instagram',
    color: '#E1306C',
    isAvailable: true,
    connectHint: 'Connect to analyze followers from your personal profile'
  },
  facebook: {
    name: 'Facebook',
    icon: 'facebook',
    color: '#1877F2',
    isAvailable: true,
    connectHint: 'Access post engagement data for demographic insights'
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'linkedin',
    color: '#0A66C2',
    isAvailable: true,
    connectHint: 'Analyze connection patterns and post engagements'
  },
  tiktok: {
    name: 'TikTok',
    icon: 'tiktok',
    color: '#000000',
    isAvailable: true,
    connectHint: 'Get engagement metrics from your TikTok videos'
  },
  pinterest: {
    name: 'Pinterest',
    icon: 'pinterest',
    color: '#BD081C',
    isAvailable: true,
    connectHint: 'Analyze pin engagement and board metrics'
  },
  threads: {
    name: 'Threads',
    icon: 'threads',
    color: '#000000',
    isAvailable: true,
    connectHint: 'Connect via Instagram to analyze Threads engagement'
  }
};

export const SocialConnectPanel: React.FC<SocialConnectPanelProps> = ({ onAccountConnected }) => {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [clientIdValues, setClientIdValues] = useState<Record<string, string>>({});
  const [clientSecretValues, setClientSecretValues] = useState<Record<string, string>>({});
  const [showApiFields, setShowApiFields] = useState<Record<string, boolean>>({});

  const handleConnect = async (platform: string) => {
    try {
      setIsConnecting(platform);

      // In a production app, these credentials would be managed server-side
      // For demo purposes, we're letting users enter their own API credentials
      const credentials = {
        clientId: clientIdValues[platform] || process.env.REACT_APP_DEFAULT_CLIENT_ID || '',
        clientSecret: clientSecretValues[platform] || process.env.REACT_APP_DEFAULT_CLIENT_SECRET || '',
        redirectUri: `${window.location.origin}/auth/${platform}/callback`
      };

      // Generate auth URL and redirect
      const authUrl = AuthService.generateAuthUrl(platform, credentials);
      
      // Store credentials temporarily for the callback
      sessionStorage.setItem(`${platform}_credentials`, JSON.stringify({
        clientId: credentials.clientId,
        clientSecret: credentials.clientSecret
      }));
      
      // Redirect to the authorization URL
      window.location.href = authUrl;
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
      setIsConnecting(null);
    }
  };

  const toggleApiFields = (platform: string) => {
    setShowApiFields(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const handleClientIdChange = (platform: string, value: string) => {
    setClientIdValues(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  const handleClientSecretChange = (platform: string, value: string) => {
    setClientSecretValues(prev => ({
      ...prev,
      [platform]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Connect Your Social Media Accounts</h2>
      <p className="text-gray-600 mb-6">
        Connect your personal social media accounts to analyze follower demographics and optimize your pricing strategy.
      </p>
      
      <div className="space-y-4">
        {Object.entries(PLATFORMS).map(([key, platform]) => (
          <div key={key} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center" 
                  style={{ backgroundColor: platform.color }}
                >
                  <i className={`fab fa-${platform.icon} text-white`}></i>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{platform.name}</h3>
                  <p className="text-sm text-gray-500">{platform.connectHint}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  className="text-sm text-gray-600 hover:text-gray-900"
                  onClick={() => toggleApiFields(key)}
                >
                  {showApiFields[key] ? 'Hide API Settings' : 'API Settings'}
                </button>
                
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  onClick={() => handleConnect(key)}
                  disabled={isConnecting === key}
                >
                  {isConnecting === key ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting...
                    </>
                  ) : 'Connect'}
                </button>
              </div>
            </div>
            
            {showApiFields[key] && (
              <div className="mt-4 border-t pt-4 space-y-3">
                <div>
                  <label htmlFor={`${key}-client-id`} className="block text-sm font-medium text-gray-700">
                    Client ID
                  </label>
                  <input
                    type="text"
                    id={`${key}-client-id`}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-purple-500 focus:border-purple-500"
                    value={clientIdValues[key] || ''}
                    onChange={(e) => handleClientIdChange(key, e.target.value)}
                    placeholder="Enter your API Client ID"
                  />
                </div>
                
                <div>
                  <label htmlFor={`${key}-client-secret`} className="block text-sm font-medium text-gray-700">
                    Client Secret
                  </label>
                  <input
                    type="password"
                    id={`${key}-client-secret`}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-purple-500 focus:border-purple-500"
                    value={clientSecretValues[key] || ''}
                    onChange={(e) => handleClientSecretChange(key, e.target.value)}
                    placeholder="Enter your API Client Secret"
                  />
                </div>
                
                <div className="text-sm text-gray-500">
                  <p>You'll need to register your app on the {platform.name} developer portal to get these credentials.</p>
                  <p>For testing, you can use our demo credentials which have limited functionality.</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-2">About Personal Profile Data</h3>
        <p className="text-sm text-gray-600">
          Social platforms provide limited follower demographic data for personal accounts. 
          Our platform uses alternative techniques to analyze engagement patterns and infer demographic information.
          For more comprehensive data, consider upgrading to business/creator profiles on each platform.
        </p>
      </div>
    </div>
  );
};

export default SocialConnectPanel; 