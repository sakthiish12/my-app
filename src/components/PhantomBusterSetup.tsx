"use client";

import { useState } from 'react';
import { FaKey, FaLightbulb, FaInfoCircle, FaExternalLinkAlt } from 'react-icons/fa';

interface PhantomBusterSetupProps {
  onClose?: () => void;
}

export default function PhantomBusterSetup({ onClose }: PhantomBusterSetupProps) {
  const [activeStep, setActiveStep] = useState(1);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">How to Set Up PhantomBuster</h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        )}
      </div>
      
      {/* Steps indicator */}
      <div className="flex mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex-1">
            <button
              onClick={() => setActiveStep(step)}
              className={`w-full py-2 ${
                activeStep === step 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } transition-colors`}
            >
              Step {step}
            </button>
          </div>
        ))}
      </div>
      
      {/* Step 1: Create PhantomBuster Account */}
      {activeStep === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaKey className="mr-2 text-blue-600" />
            Create a PhantomBuster Account
          </h3>
          
          <p className="text-gray-800">
            PhantomBuster is a web automation platform that allows you to extract data from LinkedIn without manual work.
          </p>
          
          <ol className="list-decimal pl-5 space-y-3 text-gray-800">
            <li>
              Visit <a href="https://phantombuster.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">PhantomBuster.com <FaExternalLinkAlt className="ml-1 text-xs" /></a>
            </li>
            <li>
              Click on "Sign up" and create a new account using your email or Google account
            </li>
            <li>
              Choose a plan (they offer a free trial that lets you test the platform)
            </li>
          </ol>
          
          <div className="bg-blue-50 p-4 rounded-lg flex">
            <FaLightbulb className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              Even the free trial will allow you to test this functionality, though you may need a paid plan for larger follower lists or more frequent updates.
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => setActiveStep(2)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Next Step
            </button>
          </div>
        </div>
      )}
      
      {/* Step 2: Get Your API Key */}
      {activeStep === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaKey className="mr-2 text-blue-600" />
            Get Your API Key
          </h3>
          
          <ol className="list-decimal pl-5 space-y-3 text-gray-800">
            <li>
              Log into your PhantomBuster account
            </li>
            <li>
              Click on your profile icon in the top-right corner
            </li>
            <li>
              Select "API" from the dropdown menu
            </li>
            <li>
              Copy your API key (it should look something like "g9dX2A0fC6y3Z5B8...")
            </li>
          </ol>
          
          <div className="bg-yellow-50 p-4 rounded-lg flex">
            <FaInfoCircle className="text-yellow-600 mt-1 mr-3 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              Your API key is like a password - never share it publicly and keep it secure. We encrypt your key before storing it.
            </p>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => setActiveStep(1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setActiveStep(3)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Next Step
            </button>
          </div>
        </div>
      )}
      
      {/* Step 3: Set Up LinkedIn Followers Extractor */}
      {activeStep === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaKey className="mr-2 text-blue-600" />
            Set Up LinkedIn Followers Extractor
          </h3>
          
          <ol className="list-decimal pl-5 space-y-3 text-gray-800">
            <li>
              In your PhantomBuster dashboard, click "Use this Phantom" on the <a href="https://phantombuster.com/automations/linkedin/3112/linkedin-followers-extractor" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center inline">LinkedIn Followers Extractor <FaExternalLinkAlt className="ml-1 text-xs" /></a>
            </li>
            <li>
              In the configuration, you'll need to provide your LinkedIn session cookie 
              (PhantomBuster has a <a href="https://phantombuster.com/blog/tutorials/how-to-get-your-linkedin-session-cookie-aukiv8kotfk4" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">guide</a> for this)
            </li>
            <li>
              Save the Phantom - you'll need its ID for the next step
            </li>
          </ol>
          
          <div className="bg-blue-50 p-4 rounded-lg flex">
            <FaLightbulb className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              The Phantom ID is visible in the URL when you're viewing the Phantom. It's a string of characters like "aBc7d6E9fG".
              You can also simply use your name or username as the Phantom ID to make it easier to identify.
            </p>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => setActiveStep(2)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setActiveStep(4)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Next Step
            </button>
          </div>
        </div>
      )}
      
      {/* Step 4: Connect to Our Platform */}
      {activeStep === 4 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaKey className="mr-2 text-blue-600" />
            Connect to Our Platform
          </h3>
          
          <ol className="list-decimal pl-5 space-y-3 text-gray-800">
            <li>
              Enter your PhantomBuster API key in the form provided
            </li>
            <li>
              Optionally, enter your LinkedIn Followers Extractor Phantom ID if you have it
            </li>
            <li>
              Click "Connect PhantomBuster" to securely save your credentials
            </li>
            <li>
              You'll then be able to analyze your LinkedIn followers, receive pricing recommendations, and get product ideas based on your audience
            </li>
          </ol>
          
          <div className="bg-green-50 p-4 rounded-lg flex">
            <FaInfoCircle className="text-green-600 mt-1 mr-3 flex-shrink-0" />
            <p className="text-sm text-green-800">
              We handle all the technical details of running the PhantomBuster automation for you. Just provide your API key and we'll take care of the rest!
            </p>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => setActiveStep(3)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
            >
              Previous
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Close Guide
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 