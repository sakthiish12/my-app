import { describe, it, expect } from 'vitest';

// Mock data for testing
const testCases = [
  {
    platform: 'instagram',
    username: 'test', // Will trigger microInfluencer data
    productType: 'course',
    expectedFollowers: 8500,
  },
  {
    platform: 'facebook',
    username: 'testuser', // Will trigger usHighIncome data
    productType: 'ebook',
    expectedFollowers: 25000,
  },
  {
    platform: 'tiktok',
    username: 'testinfluencer', // Will trigger majorInfluencer data
    productType: 'coaching',
    expectedFollowers: 1250000,
  }
];

describe('Social Analysis API', () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  // Test unauthorized access
  it('should return 401 for unauthorized access', async () => {
    const response = await fetch(`${API_URL}/api/social/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCases[0]),
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized access');
  });

  // Test missing required fields
  it('should return 400 for missing fields', async () => {
    const response = await fetch(`${API_URL}/api/social/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
      },
      body: JSON.stringify({
        platform: 'instagram',
        // Missing username and productType
      }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Missing required fields: platform, username, or productType');
  });

  // Test successful analysis for each test case
  testCases.forEach(({ platform, username, productType, expectedFollowers }) => {
    it(`should analyze ${platform} account "${username}" correctly`, async () => {
      const response = await fetch(`${API_URL}/api/social/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          platform,
          username,
          productType,
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      // Verify response structure
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.demographicData).toBeDefined();
      expect(data.data.pricingRecommendation).toBeDefined();

      // Verify demographic data
      const { demographicData } = data.data;
      expect(demographicData.totalFollowers).toBe(expectedFollowers);
      expect(demographicData.regions).toBeDefined();
      expect(demographicData.regions.length).toBeGreaterThan(0);
      expect(demographicData.engagementRate).toBeGreaterThan(0);

      // Verify pricing recommendation
      const { pricingRecommendation } = data.data;
      expect(pricingRecommendation.recommendedPrice).toBeGreaterThan(0);
      expect(pricingRecommendation.priceRange.min).toBeLessThan(pricingRecommendation.priceRange.max);
      expect(pricingRecommendation.conversionRatePrediction).toBeGreaterThan(0);
    });
  });
}); 