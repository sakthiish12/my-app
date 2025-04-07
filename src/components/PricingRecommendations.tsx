'use client';

import React, { useState } from 'react';
import { formatCurrency, formatPercentage } from '../lib/utils';
import axios from 'axios';

interface PricingRecommendationsProps {
  accounts: any[];
}

export default function PricingRecommendations({ accounts }: PricingRecommendationsProps) {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productType, setProductType] = useState('digital_product');
  const [productCost, setProductCost] = useState<string>('');
  const [targetMargin, setTargetMargin] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Product type options
  const productTypes = [
    { value: 'digital_product', label: 'Digital Product (e.g., eBook, Course)' },
    { value: 'physical_product', label: 'Physical Product (e.g., Merchandise)' },
    { value: 'membership', label: 'Membership/Subscription' },
    { value: 'service', label: 'Service (e.g., Coaching, Consulting)' },
    { value: 'affiliate_product', label: 'Affiliate Product' }
  ];

  const handleGenerateRecommendations = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsGenerating(true);
      setError(null);
      
      // Validate form inputs
      if (!productName.trim()) {
        throw new Error('Product name is required');
      }
      
      if (!productDescription.trim()) {
        throw new Error('Product description is required');
      }
      
      // Get the selected platforms
      const selectedPlatforms = accounts.map(account => account.platform);
      
      if (selectedPlatforms.length === 0) {
        throw new Error('You need to connect at least one social media account');
      }
      
      // Prepare the request payload
      const payload = {
        productName,
        productDescription,
        productType,
        productCost: productCost ? parseFloat(productCost) : undefined,
        targetMargin: targetMargin ? parseFloat(targetMargin) / 100 : undefined,
        platforms: selectedPlatforms
      };
      
      // Make API request to get recommendations
      const response = await axios.post('/api/pricing/recommend', payload);
      
      if (response.status === 200) {
        setRecommendations(response.data.recommendations);
      } else {
        throw new Error('Failed to generate pricing recommendations');
      }
    } catch (err: any) {
      console.error('Error generating pricing recommendations:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  // Demo data for UI preview
  const demoRecommendations = {
    overallRecommendation: {
      minPrice: 27,
      maxPrice: 49,
      optimalPrice: 37,
      conversionRate: 0.04,
      confidence: 0.85
    },
    segments: [
      {
        name: 'Core Audience',
        description: 'Your core audience of 25-34 year olds with technology interests',
        demographics: {
          age: '25-34',
          interests: 'Technology',
          location: 'North America'
        },
        price: 37,
        conversionRate: 0.045,
        confidence: 0.9
      },
      {
        name: 'Premium Segment',
        description: 'Higher income professionals aged 35-44',
        demographics: {
          age: '35-44',
          interests: 'Technology, Business',
          location: 'North America, Europe'
        },
        price: 49,
        conversionRate: 0.025,
        confidence: 0.8
      },
      {
        name: 'Value Segment',
        description: 'Younger audience, more price-sensitive',
        demographics: {
          age: '18-24',
          interests: 'Technology, Education',
          location: 'Global'
        },
        price: 27,
        conversionRate: 0.03,
        confidence: 0.75
      }
    ]
  };

  const renderRecommendations = () => {
    // Use actual recommendations if available, otherwise use demo data
    const data = recommendations || demoRecommendations;
    
    return (
      <div className="space-y-6">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-indigo-900 mb-2">Overall Recommendation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <span className="block text-sm text-indigo-600 mb-1">Optimal Price</span>
              <span className="block text-2xl font-bold text-indigo-900">
                {formatCurrency(data.overallRecommendation.optimalPrice)}
              </span>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <span className="block text-sm text-indigo-600 mb-1">Price Range</span>
              <span className="block text-2xl font-bold text-indigo-900">
                {formatCurrency(data.overallRecommendation.minPrice)} - {formatCurrency(data.overallRecommendation.maxPrice)}
              </span>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <span className="block text-sm text-indigo-600 mb-1">Est. Conversion Rate</span>
              <span className="block text-2xl font-bold text-indigo-900">
                {formatPercentage(data.overallRecommendation.conversionRate)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${data.overallRecommendation.confidence * 100}%` }}
              />
            </div>
            <span className="ml-2 text-sm text-indigo-900">
              {formatPercentage(data.overallRecommendation.confidence)} confidence
            </span>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Segment-Based Pricing</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.segments.map((segment: any, index: number) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 border-b">
                  <h4 className="font-medium text-gray-900">{segment.name}</h4>
                  <p className="text-sm text-gray-600">{segment.description}</p>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Recommended Price</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(segment.price)}</span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Est. Conversion</span>
                    <span className="text-sm font-medium text-gray-900">{formatPercentage(segment.conversionRate)}</span>
                  </div>
                  
                  <div className="flex justify-between mb-4">
                    <span className="text-sm text-gray-600">Confidence</span>
                    <span className="text-sm font-medium text-gray-900">{formatPercentage(segment.confidence)}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    {segment.demographics.age && (
                      <div className="flex">
                        <span className="w-20 font-medium">Age:</span>
                        <span>{segment.demographics.age}</span>
                      </div>
                    )}
                    
                    {segment.demographics.interests && (
                      <div className="flex">
                        <span className="w-20 font-medium">Interests:</span>
                        <span>{segment.demographics.interests}</span>
                      </div>
                    )}
                    
                    {segment.demographics.location && (
                      <div className="flex">
                        <span className="w-20 font-medium">Location:</span>
                        <span>{segment.demographics.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
          <p>
            <strong>How this works:</strong> Our pricing engine analyzes your follower demographics across 
            all platforms and compares them with conversion data from similar products. This helps determine 
            optimal price points for different audience segments.
          </p>
        </div>
      </div>
    );
  };

  if (accounts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Pricing Recommendations</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          <p>Please connect at least one social media account to get pricing recommendations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Pricing Recommendations</h2>
        
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {!recommendations ? (
          <>
            <p className="text-gray-600 mb-6">
              Enter your product details below to get AI-powered pricing recommendations based on your 
              audience demographics across {accounts.length} connected social platforms.
            </p>
            
            <form onSubmit={handleGenerateRecommendations} className="space-y-4">
              <div>
                <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Social Media Marketing Course"
                />
              </div>
              
              <div>
                <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Description
                </label>
                <textarea
                  id="productDescription"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Briefly describe your product and its key benefits..."
                />
              </div>
              
              <div>
                <label htmlFor="productType" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Type
                </label>
                <select
                  id="productType"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {productTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="productCost" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Cost (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="number"
                      id="productCost"
                      value={productCost}
                      onChange={(e) => setProductCost(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="targetMargin" className="block text-sm font-medium text-gray-700 mb-1">
                    Target Profit Margin % (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="targetMargin"
                      value={targetMargin}
                      onChange={(e) => setTargetMargin(e.target.value)}
                      className="w-full pr-7 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 40"
                      min="0"
                      max="100"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500">%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Recommendations...
                    </>
                  ) : (
                    'Generate Pricing Recommendations'
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{productName}</h3>
                <p className="text-sm text-gray-600">{productDescription}</p>
              </div>
              <button
                onClick={() => setRecommendations(null)}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Create New Recommendation
              </button>
            </div>
            
            {renderRecommendations()}
          </>
        )}
      </div>
    </div>
  );
} 