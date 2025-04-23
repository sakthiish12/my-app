'use client';

import { useState, useEffect } from 'react';

// Get the day of the year (1-366)
const getDayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

// Get a stable seed that changes each day but stays the same for the whole day
const getDailySeed = () => {
  const now = new Date();
  // Combine year and day of year to create a unique number for each day
  return (now.getFullYear() * 1000) + getDayOfYear();
};

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch a prompt from OpenAI's API
  const fetchAIPrompt = async () => {
    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch prompt');
      }
      
      const data = await response.json();
      setPrompt(data.prompt);
      setError('');
      
    } catch (error) {
      console.error('Error fetching prompt:', error);
      setError('Unable to generate today\'s prompt. Please try again later.');
      setPrompt('');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch the AI-generated prompt
    fetchAIPrompt();
    
    // Check user's preferred color scheme
    if (typeof window !== 'undefined') {
      const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(isDarkMode);
      
      // Add listener for changes in color scheme preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      
      // Check if user has a saved preference
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode !== null) {
        setDarkMode(savedMode === 'true');
      }
      
      // Add a small delay to trigger the animation
      setTimeout(() => {
        setIsLoaded(true);
      }, 300);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);
  
  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', darkMode.toString());
    }
  }, [darkMode]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'}`}>
      <button 
        onClick={toggleDarkMode}
        className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${darkMode ? 'bg-gray-800 text-yellow-300 hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-100'}`}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
      
      <main className={`w-full max-w-2xl transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <header className="text-center mb-8 md:mb-12">
          <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'}`}>
            Daily Prompt
          </h1>
          <p className={`max-w-md mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            A personal reflection prompt for your AI conversation today
          </p>
        </header>

        <div className={`rounded-2xl shadow-xl p-6 md:p-8 mb-8 transform transition-all duration-500 ${darkMode ? 'bg-gray-800 hover:shadow-indigo-900/20' : 'bg-white hover:shadow-2xl'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>Today's Prompt</h2>
            <div className={`text-sm px-3 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-500'}`}>
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          
          <div className={`p-6 rounded-xl border mb-6 transition-all hover:shadow-inner ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100'}`}>
            {isLoading ? (
              <div className="flex justify-center items-center h-24">
                <div className="animate-pulse flex space-x-2">
                  <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                </div>
              </div>
            ) : error ? (
              <p className={`text-xl font-medium leading-relaxed ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                {error}
              </p>
            ) : (
              <p className={`text-xl font-medium leading-relaxed ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                {prompt}
              </p>
            )}
          </div>
          
          <button
            onClick={copyToClipboard}
            disabled={isLoading || !!error}
            className={`w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center relative overflow-hidden group ${(isLoading || !!error) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
          >
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
            <span className="relative flex items-center">
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy prompt
                </>
              )}
            </span>
          </button>
        </div>
        
        <div className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>A new prompt will be available tomorrow.</p>
          <div className="mt-4 flex flex-col items-center">
            <p>© {new Date().getFullYear()} Daily Prompt</p>
            <p className="mt-2">
              Made by{" "}
              <a 
                href="https://www.linkedin.com/in/mustafarasheed/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-500 hover:text-indigo-400 font-medium"
              >
                @Mustafa Rasheed
              </a>
              {" & "}
              <a 
                href="https://www.linkedin.com/in/sakthiish-vijayadass/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-500 hover:text-indigo-400 font-medium"
              >
                @Sakthiish Vijayadass
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 