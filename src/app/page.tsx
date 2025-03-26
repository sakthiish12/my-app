'use client';

import Link from 'next/link';
import { useState } from 'react';

// Logo component
const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="relative w-8 h-8">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg transform rotate-45"></div>
      <div className="absolute inset-1 bg-white rounded-md transform rotate-45 flex items-center justify-center">
        <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text font-bold text-lg transform -rotate-45">S</span>
      </div>
    </div>
    <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
      SocioPrice
    </span>
  </div>
);

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    socialPlatform: '',
    followers: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        socialPlatform: '',
        followers: '',
      });
      setSubmitted(false);
      setShowModal(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm fixed w-full z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          <nav className="flex items-center gap-4">
            <button 
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:opacity-90 transition-all shadow-md hover:shadow-lg"
              onClick={() => setShowModal(true)}
            >
              Join the Waitlist
            </button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 py-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Social-First Pricing Intelligence
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              SocioPrice uses AI to analyze your audience demographics and engagement metrics,
              delivering personalized pricing recommendations that maximize your revenue.
            </p>
            <button
              className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:opacity-90 transition-all shadow-lg hover:shadow-xl text-lg font-medium"
              onClick={() => setShowModal(true)}
            >
              Start Optimizing Your Pricing
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <div className="text-indigo-600 mb-4 text-4xl font-bold">01</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Connect Your Platforms</h3>
              <p className="text-gray-600 leading-relaxed">
                Seamlessly integrate with your favorite social media and content platforms for comprehensive audience analysis.
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <div className="text-indigo-600 mb-4 text-4xl font-bold">02</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">AI-Powered Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Our AI analyzes engagement patterns, demographic data, and market trends to understand your audience's value perception.
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              <div className="text-indigo-600 mb-4 text-4xl font-bold">03</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Smart Recommendations</h3>
              <p className="text-gray-600 leading-relaxed">
                Get data-driven pricing strategies and dynamic recommendations that evolve with your audience.
              </p>
            </div>
          </div>

          {/* Compatible Platforms Section */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-8 text-center text-gray-800">
              Compatible Platforms
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: 'Instagram', icon: '📸' },
                { name: 'Facebook', icon: '👥' },
                { name: 'TikTok', icon: '🎵' },
                { name: 'LinkedIn', icon: '💼' },
                { name: 'YouTube', icon: '🎥' },
                { name: 'Twitter', icon: '🐦' },
                { name: 'Pinterest', icon: '📌' },
                { name: 'Threads', icon: '🧵' },
              ].map((platform) => (
                <div key={platform.name} 
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-3"
                >
                  <span className="text-2xl">{platform.icon}</span>
                  <span className="font-medium text-gray-700">{platform.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Tools Section */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-8 text-center text-gray-800">
              Integration Tools
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: 'Canva', category: 'Design' },
                { name: 'Mailchimp', category: 'Email' },
                { name: 'Shopify', category: 'E-commerce' },
                { name: 'Zapier', category: 'Automation' },
                { name: 'Buffer', category: 'Social Media' },
                { name: 'Notion', category: 'Planning' },
                { name: 'Google Analytics', category: 'Analytics' },
                { name: 'Stripe', category: 'Payments' },
              ].map((tool) => (
                <div key={tool.name} 
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <div className="font-medium text-gray-800">{tool.name}</div>
                  <div className="text-sm text-gray-500">{tool.category}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <Logo />
              <p className="text-gray-400 mt-4">
                Empowering creators with intelligent pricing strategies
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Quick Links</h5>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a>
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Legal</h5>
              <div className="flex flex-col gap-2">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} SocioPrice. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Waitlist Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowModal(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-green-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome Aboard!</h3>
                <p className="text-gray-600">
                  You're now on the waitlist! We'll notify you as soon as SocioPrice launches.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Join Our Waitlist</h3>
                <p className="text-gray-600 mb-6">
                  Be the first to optimize your pricing with AI-powered insights.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="socialPlatform" className="block text-sm font-medium text-gray-700 mb-1">
                      Primary Platform
                    </label>
                    <select
                      id="socialPlatform"
                      name="socialPlatform"
                      value={formData.socialPlatform}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      required
                    >
                      <option value="">Select your main platform</option>
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="tiktok">TikTok</option>
                      <option value="youtube">YouTube</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="twitter">Twitter</option>
                      <option value="threads">Threads</option>
                      <option value="pinterest">Pinterest</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="followers" className="block text-sm font-medium text-gray-700 mb-1">
                      Follower Count
                    </label>
                    <select
                      id="followers"
                      name="followers"
                      value={formData.followers}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      required
                    >
                      <option value="">Select your audience size</option>
                      <option value="1-5k">1,000 - 5,000 followers</option>
                      <option value="5-25k">5,000 - 25,000 followers</option>
                      <option value="25-100k">25,000 - 100,000 followers</option>
                      <option value="100k-500k">100,000 - 500,000 followers</option>
                      <option value="500k+">500,000+ followers</option>
                    </select>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all font-medium"
                  >
                    Join Waitlist
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
