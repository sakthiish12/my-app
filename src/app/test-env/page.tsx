"use client";

import { useEffect, useState } from 'react';

export default function TestEnvPage() {
  const [variables, setVariables] = useState<{[key: string]: string}>({});
  
  useEffect(() => {
    // Collect all NEXT_PUBLIC_ environment variables
    const envVars: {[key: string]: string} = {};
    
    // Get all keys from process.env
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('NEXT_PUBLIC_')) {
        envVars[key] = process.env[key] || '';
      }
    });
    
    // Directly check for specific variables
    envVars['NEXT_PUBLIC_LINKEDIN_CLIENT_ID'] = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || 'NOT FOUND';
    envVars['NEXT_PUBLIC_BASE_URL'] = process.env.NEXT_PUBLIC_BASE_URL || 'NOT FOUND';
    
    setVariables(envVars);
  }, []);
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Client-Side Environment Variables</h2>
        {Object.keys(variables).length === 0 ? (
          <p className="text-red-600">No client-side environment variables found!</p>
        ) : (
          <ul className="space-y-2">
            {Object.entries(variables).map(([key, value]) => (
              <li key={key} className="flex flex-col">
                <span className="font-medium">{key}:</span>
                <span className={value === 'NOT FOUND' ? 'text-red-600' : 'text-green-600'}>
                  {value ? (value.length > 10 ? `${value.substring(0, 10)}...` : value) : 'empty string'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="flex space-x-4">
        <a 
          href="/dashboard/linkedin" 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to LinkedIn Dashboard
        </a>
        
        <a 
          href="/login/linkedin" 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Go to LinkedIn Login
        </a>
      </div>
    </div>
  );
} 