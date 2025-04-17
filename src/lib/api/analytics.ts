import { DemographicData } from '@/types/pricing';

export async function fetchDemographics(userId: string) {
  const response = await fetch(`/api/analytics/demographics/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch demographics data');
  }
  return response.json();
}

export async function fetchEngagementMetrics(userId: string) {
  const response = await fetch(`/api/analytics/engagement/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch engagement metrics');
  }
  return response.json();
}

export async function fetchRevenueData(userId: string) {
  const response = await fetch(`/api/analytics/revenue/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch revenue data');
  }
  return response.json();
}

export async function fetchPricingData(userId: string) {
  const response = await fetch(`/api/analytics/pricing/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch pricing data');
  }
  return response.json();
} 