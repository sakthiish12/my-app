"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    price: 29,
    period: 'month',
    features: [
      'Basic audience analytics',
      'Up to 3 social accounts',
      'Monthly pricing recommendations',
      'Basic support',
    ],
    recommended: false,
    priceId: {
      month: 'price_XXXXX', // Replace with your Stripe price IDs
      year: 'price_YYYYY',
    },
  },
  {
    name: 'Professional',
    price: 79,
    period: 'month',
    features: [
      'Advanced audience analytics',
      'Up to 10 social accounts',
      'Weekly pricing recommendations',
      'Priority support',
      'Custom pricing strategies',
      'Revenue forecasting',
    ],
    recommended: true,
    priceId: {
      month: 'price_XXXXX', // Replace with your Stripe price IDs
      year: 'price_YYYYY',
    },
  },
  {
    name: 'Enterprise',
    price: 199,
    period: 'month',
    features: [
      'Enterprise-grade analytics',
      'Unlimited social accounts',
      'Daily pricing recommendations',
      '24/7 dedicated support',
      'Custom API integration',
      'Advanced revenue forecasting',
      'White-label reports',
    ],
    recommended: false,
    priceId: {
      month: 'price_XXXXX', // Replace with your Stripe price IDs
      year: 'price_YYYYY',
    },
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');

  const handleSubscribe = async (plan: typeof plans[0]) => {
    try {
      const priceId = plan.priceId[billingPeriod];
      await createCheckoutSession(priceId);
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      // You might want to show an error message to the user
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm fixed w-full z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            SocioPrice
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/sign-in" className="text-indigo-600 hover:text-indigo-800">
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 mb-8">
            Get started with the perfect plan for your business
          </p>

          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1 mb-8">
            <button
              className={`px-4 py-2 rounded-md ${
                billingPeriod === 'month'
                  ? 'bg-white shadow-sm text-indigo-600'
                  : 'text-gray-600'
              }`}
              onClick={() => setBillingPeriod('month')}
            >
              Monthly
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                billingPeriod === 'year'
                  ? 'bg-white shadow-sm text-indigo-600'
                  : 'text-gray-600'
              }`}
              onClick={() => setBillingPeriod('year')}
            >
              Yearly
              <span className="ml-1 text-sm text-green-500">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl shadow-lg p-8 relative ${
                plan.recommended
                  ? 'ring-2 ring-indigo-600 transform md:-translate-y-4'
                  : ''
              }`}
            >
              {plan.recommended && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm">
                    Recommended
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${billingPeriod === 'year' ? Math.floor(plan.price * 0.8) : plan.price}
                </span>
                <span className="text-gray-600">/{billingPeriod}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center text-gray-600">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan)}
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  plan.recommended
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 