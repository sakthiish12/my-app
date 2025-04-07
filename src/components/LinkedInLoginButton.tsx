"use client";

import { useEffect, useState, useCallback } from 'react';
import clientEnv from '@/lib/clientEnv';
import crypto from 'crypto';

interface LinkedInLoginButtonProps {
  className?: string;
  buttonText?: string;
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

export default function LinkedInLoginButton({
  className = '',
  buttonText = 'Sign in with LinkedIn',
  onError,
  onSuccess
}: LinkedInLoginButtonProps) {
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle the actual OAuth flow
  const handleAuth = useCallback(() => {
    try {
      if (!authUrl) return;
      
      setIsLoading(true);
      
      // Open the LinkedIn authorization URL in a popup window
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        authUrl,
        'linkedin-oauth',
        `width=${width},height=${height},left=${left},top=${top},toolbar=0,scrollbars=1,status=1,resizable=1,location=1`
      );
      
      // Function to poll the popup and detect when it's redirected to our callback URL
      const checkPopup = setInterval(() => {
        try {
          // If popup closed, clear interval
          if (!popup || popup.closed) {
            clearInterval(checkPopup);
            setIsLoading(false);
            return;
          }
          
          // Try to check if the popup location is our callback URL
          const currentUrl = popup.location.href;
          
          // If it's our callback URL with success parameter, we're done
          if (currentUrl.includes('/dashboard/linkedin?oauth=success') || 
              currentUrl.includes('/dashboard/linkedin?code=')) {
            // Success! Close popup and notify parent
            clearInterval(checkPopup);
            popup.close();
            setIsLoading(false);
            onSuccess?.();
            
            // Redirect main window to dashboard with success if no success handler
            if (!onSuccess) {
              window.location.href = '/dashboard/linkedin?oauth=success';
            }
          }
          
          // If it contains an error parameter
          if (currentUrl.includes('error=')) {
            // Extract error message
            const errorMsg = new URL(currentUrl).searchParams.get('error') || 'Unknown error';
            clearInterval(checkPopup);
            popup.close();
            setIsLoading(false);
            handleError(`Authentication failed: ${errorMsg}`);
          }
        } catch (e) {
          // Cross-origin exception will be thrown when the popup navigates to LinkedIn domain
          // This is expected and can be ignored
        }
      }, 500);
      
      // Set a timeout to clear the interval after 5 minutes
      setTimeout(() => {
        clearInterval(checkPopup);
        if (popup && !popup.closed) {
          popup.close();
        }
        setIsLoading(false);
      }, 5 * 60 * 1000);
      
    } catch (err) {
      handleError('Failed to open authentication popup');
      setIsLoading(false);
    }
  }, [authUrl, onSuccess]);

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
    onError?.(errorMsg);
  };

  useEffect(() => {
    try {
      // Generate a state parameter to prevent CSRF attacks
      const state = crypto.randomBytes(16).toString('hex');
      
      // Store state in localStorage for verification on callback
      localStorage.setItem('linkedin_oauth_state', state);
      
      // Get LinkedIn application credentials
      const clientId = clientEnv.linkedInClientId;
      
      if (!clientId) {
        handleError('LinkedIn client ID not configured');
        return;
      }
      
      // Build the redirect URI
      const baseUrl = clientEnv.baseUrl || window.location.origin;
      let redirectUri;
      
      // Use different paths for production vs development
      if (baseUrl.includes('socioprice.com')) {
        redirectUri = baseUrl; // Just use the root domain as registered
      } else {
        redirectUri = `${baseUrl}/dashboard/linkedin`;
      }
      
      // Store the redirect URI for later use during token exchange
      localStorage.setItem('linkedin_redirect_uri', redirectUri);
      
      // Build the authorization URL
      const url = new URL('https://www.linkedin.com/oauth/v2/authorization');
      url.searchParams.append('response_type', 'code');
      url.searchParams.append('client_id', clientId);
      url.searchParams.append('redirect_uri', redirectUri);
      url.searchParams.append('state', state);
      
      // Use OpenID Connect scopes instead of LinkedIn API scopes
      url.searchParams.append('scope', 'openid profile email');
      
      console.log("LinkedIn Auth URL:", url.toString());
      
      setAuthUrl(url.toString());
    } catch (err) {
      handleError('Failed to prepare LinkedIn login');
      console.error('Error preparing LinkedIn login:', err);
    }
  }, []);

  if (error) {
    return (
      <button 
        disabled 
        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-400 ${className}`}
      >
        LinkedIn login unavailable
      </button>
    );
  }

  if (!authUrl) {
    return (
      <button 
        disabled 
        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-400 animate-pulse ${className}`}
      >
        Loading...
      </button>
    );
  }

  return (
    <button
      onClick={handleAuth}
      disabled={isLoading}
      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isLoading ? 'bg-blue-400 cursor-wait' : 'bg-[#0077B5] hover:bg-[#0066a1]'} ${className}`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Connecting...
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M15,3C8.373,3,3,8.373,3,15c0,6.627,5.373,12,12,12s12-5.373,12-12C27,8.373,21.627,3,15,3z M10.496,8.403 c0.842,0,1.403,0.561,1.403,1.309c0,0.748-0.561,1.309-1.496,1.309C9.561,11.022,9,10.46,9,9.712 C9,8.964,9.561,8.403,10.496,8.403z M12,20H9v-8h3V20z M22,20h-2.824v-4.372c0-1.209-0.753-1.488-1.035-1.488 s-1.224,0.186-1.224,1.488c0,0.186,0,4.372,0,4.372H14v-8h2.918v1.116C17.294,12.465,18.047,12,19.459,12 C20.871,12,22,13.116,22,15.628V20z"></path>
          </svg>
          {buttonText}
        </>
      )}
    </button>
  );
} 