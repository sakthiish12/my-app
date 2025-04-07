import { MongoClient, Db } from 'mongodb';
import PhantomBusterService, { LinkedInFollowerData } from './PhantomBusterService';
import LinkedInFollower from '../models/LinkedInFollower';
import LinkedInAnalytics from '../models/LinkedInAnalytics';
import mongoose from 'mongoose';

export interface IncomeBracket {
  min: number;
  max: number;
}

export interface PurchasingPower {
  level: string;
  factor: number;
}

export class LinkedInService {
  private phantomBuster: PhantomBusterService;
  private db: Db | null = null;
  
  // Industry to estimated income mapping (in USD)
  private industryIncomeMap: Record<string, IncomeBracket> = {
    'Technology': { min: 80000, max: 150000 },
    'Finance': { min: 90000, max: 180000 },
    'Healthcare': { min: 75000, max: 140000 },
    'Education': { min: 50000, max: 90000 },
    'Marketing': { min: 60000, max: 120000 },
    'Sales': { min: 65000, max: 130000 },
    'Human Resources': { min: 55000, max: 100000 },
    'Consulting': { min: 85000, max: 160000 },
    'Legal': { min: 90000, max: 170000 },
    'Manufacturing': { min: 60000, max: 110000 },
    'Real Estate': { min: 70000, max: 140000 },
    'Retail': { min: 45000, max: 85000 },
    'Media': { min: 55000, max: 110000 },
    'Hospitality': { min: 40000, max: 80000 },
    'Transportation': { min: 50000, max: 95000 },
    'Construction': { min: 55000, max: 100000 },
    'Government': { min: 60000, max: 110000 },
    'Non-profit': { min: 45000, max: 85000 },
    'Agriculture': { min: 45000, max: 90000 },
    'Energy': { min: 75000, max: 140000 },
  };
  
  // Seniority to income multiplier
  private seniorityMultiplier: Record<string, number> = {
    'Entry': 0.7,
    'Junior': 0.9,
    'Mid-level': 1.0,
    'Senior': 1.3,
    'Manager': 1.5,
    'Director': 1.8,
    'Executive': 2.5,
    'C-level': 3.0,
  };
  
  // Location to purchasing power adjustments
  private locationPurchasingPower: Record<string, PurchasingPower> = {
    'San Francisco': { level: 'High', factor: 0.7 }, // High cost of living reduces purchasing power
    'New York': { level: 'High', factor: 0.75 },
    'London': { level: 'High', factor: 0.8 },
    'Tokyo': { level: 'High', factor: 0.85 },
    'Sydney': { level: 'Medium-High', factor: 0.9 },
    'Chicago': { level: 'Medium', factor: 1.0 },
    'Berlin': { level: 'Medium', factor: 1.1 },
    'Austin': { level: 'Medium', factor: 1.2 },
    'Denver': { level: 'Medium', factor: 1.2 },
    'Toronto': { level: 'Medium', factor: 1.0 },
    'Madrid': { level: 'Medium-Low', factor: 1.3 },
    'Bangkok': { level: 'Low', factor: 1.8 },
    'Mexico City': { level: 'Low', factor: 1.7 },
    'Mumbai': { level: 'Low', factor: 2.0 },
  };
  
  constructor(phantomBusterApiKey: string) {
    this.phantomBuster = new PhantomBusterService(phantomBusterApiKey);
  }
  
  /**
   * Initialize the database connection
   */
  async initDb() {
    if (!this.db) {
      const client = await MongoClient.connect(process.env.MONGODB_URI as string);
      this.db = client.db();
    }
  }
  
  /**
   * Fetch LinkedIn followers and save to database
   */
  async fetchAndSaveFollowers(userId: string, linkedinProfileUrl: string): Promise<number> {
    try {
      // Ensure MongoDB connection
      await mongoose.connect(process.env.MONGODB_URI as string);
      
      // Fetch followers from PhantomBuster
      const followers = await this.phantomBuster.fetchLinkedInFollowers(linkedinProfileUrl);
      
      // Process and enrich follower data
      const enrichedFollowers = this.enrichFollowerData(followers);
      
      // Save followers to database
      for (const follower of enrichedFollowers) {
        await LinkedInFollower.findOneAndUpdate(
          { 
            userId: userId,
            profileUrl: follower.profileUrl 
          },
          {
            userId: userId,
            name: follower.name,
            headline: follower.headline,
            profileUrl: follower.profileUrl,
            location: follower.location,
            industry: follower.industry,
            company: follower.company,
            position: follower.position,
            connectionDegree: follower.connectionDegree,
            profileImageUrl: follower.profileImageUrl,
            estimatedIncome: follower.customData?.estimatedIncome,
            purchasingPower: follower.customData?.purchasingPower,
            engagementLevel: follower.customData?.engagementLevel,
          },
          { 
            upsert: true,
            new: true 
          }
        );
      }
      
      // Generate and save analytics
      await this.generateAndSaveAnalytics(userId);
      
      return followers.length;
    } catch (error) {
      console.error('Error fetching and saving LinkedIn followers:', error);
      throw error;
    }
  }
  
  /**
   * Enrich follower data with estimated income, purchasing power, etc.
   */
  private enrichFollowerData(followers: LinkedInFollowerData[]): LinkedInFollowerData[] {
    return followers.map(follower => {
      // Determine industry
      const industry = follower.industry || this.extractIndustryFromHeadline(follower.headline);
      
      // Determine position/seniority
      const position = follower.position || this.extractPositionFromHeadline(follower.headline);
      const seniority = this.determineSeniority(position);
      
      // Estimate income
      const estimatedIncome = this.estimateIncome(industry, seniority);
      
      // Assess purchasing power
      const purchasingPower = this.assessPurchasingPower(follower.location, estimatedIncome);
      
      // Estimate engagement level
      const engagementLevel = this.estimateEngagementLevel(follower.connectionDegree || '');
      
      return {
        ...follower,
        industry,
        position,
        customData: {
          estimatedIncome,
          purchasingPower,
          engagementLevel,
          seniority,
        }
      };
    });
  }
  
  /**
   * Extract industry from headline if not provided
   */
  private extractIndustryFromHeadline(headline: string): string {
    // Simple keyword matching - this could be enhanced with NLP
    const headline_lower = headline.toLowerCase();
    
    for (const industry of Object.keys(this.industryIncomeMap)) {
      if (headline_lower.includes(industry.toLowerCase())) {
        return industry;
      }
    }
    
    // Default if no match
    return 'Other';
  }
  
  /**
   * Extract position from headline
   */
  private extractPositionFromHeadline(headline: string): string {
    // Common position titles to look for
    const positionKeywords = [
      'CEO', 'CTO', 'CFO', 'COO', 'CMO', 'CHRO', 'CIO',
      'Director', 'Manager', 'Lead', 'Senior', 'Junior',
      'VP', 'Vice President', 'President', 'Head of',
      'Engineer', 'Developer', 'Designer', 'Consultant',
      'Specialist', 'Coordinator', 'Associate', 'Assistant',
    ];
    
    const headline_words = headline.split(/\s+/);
    
    for (const keyword of positionKeywords) {
      if (headline.includes(keyword)) {
        // Try to capture position with context (e.g., "Senior Software Engineer")
        const index = headline_words.findIndex(word => 
          word.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (index !== -1) {
          // Try to capture 3 words around the keyword
          const start = Math.max(0, index - 1);
          const end = Math.min(headline_words.length, index + 2);
          return headline_words.slice(start, end).join(' ');
        }
        
        return keyword;
      }
    }
    
    return 'Other';
  }
  
  /**
   * Determine seniority from position
   */
  private determineSeniority(position: string): string {
    const position_lower = position.toLowerCase();
    
    if (position_lower.includes('ceo') || 
        position_lower.includes('cto') || 
        position_lower.includes('cfo') || 
        position_lower.includes('coo') || 
        position_lower.includes('chief')) {
      return 'C-level';
    } else if (position_lower.includes('vp') || 
               position_lower.includes('vice president') || 
               position_lower.includes('president')) {
      return 'Executive';
    } else if (position_lower.includes('director') || 
               position_lower.includes('head of')) {
      return 'Director';
    } else if (position_lower.includes('manager') || 
               position_lower.includes('lead')) {
      return 'Manager';
    } else if (position_lower.includes('senior') || 
               position_lower.includes('sr')) {
      return 'Senior';
    } else if (position_lower.includes('junior') || 
               position_lower.includes('jr') || 
               position_lower.includes('associate')) {
      return 'Junior';
    } else if (position_lower.includes('intern') || 
               position_lower.includes('trainee')) {
      return 'Entry';
    } else {
      return 'Mid-level';
    }
  }
  
  /**
   * Estimate income based on industry and seniority
   */
  private estimateIncome(industry: string, seniority: string): string {
    const incomeBracket = this.industryIncomeMap[industry] || { min: 50000, max: 100000 };
    const multiplier = this.seniorityMultiplier[seniority] || 1.0;
    
    // Calculate range
    const minIncome = Math.round(incomeBracket.min * multiplier);
    const maxIncome = Math.round(incomeBracket.max * multiplier);
    
    // Return as range
    return `$${minIncome.toLocaleString()} - $${maxIncome.toLocaleString()}`;
  }
  
  /**
   * Assess purchasing power based on location and estimated income
   */
  private assessPurchasingPower(location: string, estimatedIncome: string): string {
    // Extract numeric value from income range
    const incomeMatch = estimatedIncome.match(/\$([0-9,]+)/);
    if (!incomeMatch) return 'Medium';
    
    const income = parseInt(incomeMatch[1].replace(/,/g, ''), 10);
    
    // Look for location match
    let purchasingPower: PurchasingPower = { level: 'Medium', factor: 1.0 };
    
    for (const [loc, pp] of Object.entries(this.locationPurchasingPower)) {
      if (location.includes(loc)) {
        purchasingPower = pp;
        break;
      }
    }
    
    // Adjust based on location factor
    const adjustedIncome = income * purchasingPower.factor;
    
    if (adjustedIncome > 150000) return 'Very High';
    if (adjustedIncome > 100000) return 'High';
    if (adjustedIncome > 70000) return 'Medium-High';
    if (adjustedIncome > 50000) return 'Medium';
    if (adjustedIncome > 30000) return 'Medium-Low';
    return 'Low';
  }
  
  /**
   * Estimate engagement level based on connection degree
   */
  private estimateEngagementLevel(connectionDegree: string): string {
    if (connectionDegree.includes('1st')) {
      return 'High';
    } else if (connectionDegree.includes('2nd')) {
      return 'Medium';
    } else {
      return 'Low';
    }
  }
  
  /**
   * Generate analytics from follower data
   */
  async generateAndSaveAnalytics(userId: string): Promise<void> {
    try {
      // Fetch followers from database
      const followers = await LinkedInFollower.find({ userId });
      
      if (followers.length === 0) {
        throw new Error('No followers found for analytics generation');
      }
      
      // Generate demographic analysis
      const industries: Record<string, number> = {};
      const locations: Record<string, number> = {};
      const companies: Record<string, number> = {};
      const jobTitles: Record<string, number> = {};
      const seniority: Record<string, number> = {};
      const purchasingPower: Record<string, number> = {};
      
      followers.forEach(follower => {
        // Count industries
        if (follower.industry) {
          industries[follower.industry] = (industries[follower.industry] || 0) + 1;
        }
        
        // Count locations
        if (follower.location) {
          locations[follower.location] = (locations[follower.location] || 0) + 1;
        }
        
        // Count companies
        if (follower.company) {
          companies[follower.company] = (companies[follower.company] || 0) + 1;
        }
        
        // Count job titles
        if (follower.position) {
          jobTitles[follower.position] = (jobTitles[follower.position] || 0) + 1;
        }
        
        // Count purchasing power
        if (follower.purchasingPower) {
          purchasingPower[follower.purchasingPower] = (purchasingPower[follower.purchasingPower] || 0) + 1;
        }
        
        // Extract and count seniority from position
        if (follower.position) {
          const seniorityLevel = this.determineSeniority(follower.position);
          seniority[seniorityLevel] = (seniority[seniorityLevel] || 0) + 1;
        }
      });
      
      // Calculate percentages
      const totalFollowers = followers.length;
      const calculatePercentages = (data: Record<string, number>) => {
        const result: Record<string, number> = {};
        for (const [key, count] of Object.entries(data)) {
          result[key] = parseFloat(((count / totalFollowers) * 100).toFixed(2));
        }
        return result;
      };
      
      // Generate pricing recommendations
      const pricingRecommendations = this.generatePricingRecommendations(
        calculatePercentages(purchasingPower),
        calculatePercentages(seniority),
        calculatePercentages(industries)
      );
      
      // Generate product recommendations
      const productRecommendations = this.generateProductRecommendations(
        calculatePercentages(industries),
        calculatePercentages(seniority)
      );
      
      // Save analytics to database
      await LinkedInAnalytics.findOneAndUpdate(
        { userId },
        {
          userId,
          totalFollowers,
          industries: calculatePercentages(industries),
          locations: calculatePercentages(locations),
          companies: calculatePercentages(companies),
          jobTitles: calculatePercentages(jobTitles),
          seniority: calculatePercentages(seniority),
          recommendedPricing: pricingRecommendations,
          productRecommendations,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );
      
    } catch (error) {
      console.error('Error generating LinkedIn analytics:', error);
      throw error;
    }
  }
  
  /**
   * Generate pricing recommendations based on follower demographics
   */
  private generatePricingRecommendations(
    purchasingPower: Record<string, number>,
    seniority: Record<string, number>,
    industries: Record<string, number>
  ): any {
    // Calculate a pricing factor based on demographics
    let pricingFactor = 1.0;
    
    // Adjust based on purchasing power
    const highPowerPercentage = (purchasingPower['Very High'] || 0) + 
                               (purchasingPower['High'] || 0) + 
                               (purchasingPower['Medium-High'] || 0);
    
    if (highPowerPercentage > 50) {
      pricingFactor *= 1.3;
    } else if (highPowerPercentage > 30) {
      pricingFactor *= 1.15;
    } else if (highPowerPercentage < 15) {
      pricingFactor *= 0.85;
    }
    
    // Adjust based on seniority
    const seniorPercentage = (seniority['C-level'] || 0) + 
                            (seniority['Executive'] || 0) + 
                            (seniority['Director'] || 0) + 
                            (seniority['Manager'] || 0);
    
    if (seniorPercentage > 40) {
      pricingFactor *= 1.25;
    } else if (seniorPercentage > 25) {
      pricingFactor *= 1.1;
    } else if (seniorPercentage < 15) {
      pricingFactor *= 0.9;
    }
    
    // Adjust based on high-paying industries
    const highPayingIndustries = ['Technology', 'Finance', 'Consulting', 'Legal', 'Healthcare', 'Energy'];
    let highPayingPercentage = 0;
    
    for (const industry of highPayingIndustries) {
      highPayingPercentage += industries[industry] || 0;
    }
    
    if (highPayingPercentage > 60) {
      pricingFactor *= 1.2;
    } else if (highPayingPercentage > 40) {
      pricingFactor *= 1.1;
    } else if (highPayingPercentage < 20) {
      pricingFactor *= 0.9;
    }
    
    // Base prices for different product types
    const baseEbook = { min: 15, max: 30, optimal: 20 };
    const baseOnlineCourse = { min: 100, max: 500, optimal: 250 };
    const baseTemplate = { min: 25, max: 100, optimal: 50 };
    const baseCoaching = { min: 100, max: 300, optimal: 150, hourly: 75 };
    const baseMembership = { min: 10, max: 50, optimal: 25 };
    
    // Apply pricing factor to base prices
    const applyFactor = (base: any) => {
      return {
        min: Math.round(base.min * pricingFactor),
        max: Math.round(base.max * pricingFactor),
        optimal: Math.round(base.optimal * pricingFactor),
        ...(base.hourly ? { hourly: Math.round(base.hourly * pricingFactor) } : {})
      };
    };
    
    // Generate tiered pricing
    const basicPrice = Math.round(baseMembership.optimal * pricingFactor * 0.8);
    const professionalPrice = Math.round(baseMembership.optimal * pricingFactor * 1.5);
    const enterprisePrice = Math.round(baseMembership.optimal * pricingFactor * 3);
    
    return {
      digitalProducts: {
        ebook: applyFactor(baseEbook),
        onlineCourse: applyFactor(baseOnlineCourse),
        template: applyFactor(baseTemplate),
        coaching: applyFactor(baseCoaching),
        membership: applyFactor(baseMembership),
      },
      
      premiumTiers: {
        basic: {
          price: basicPrice,
          features: [
            "Core content access",
            "Monthly newsletter",
            "Community forum access"
          ]
        },
        professional: {
          price: professionalPrice,
          features: [
            "All Basic tier features",
            "Premium content library",
            "Monthly group Q&A session",
            "Downloadable resources"
          ]
        },
        enterprise: {
          price: enterprisePrice,
          features: [
            "All Professional tier features",
            "1-on-1 consulting session",
            "Priority support",
            "Custom content requests",
            "Early access to new content"
          ]
        }
      }
    };
  }
  
  /**
   * Generate product recommendations based on follower demographics
   */
  private generateProductRecommendations(
    industries: Record<string, number>,
    seniority: Record<string, number>
  ): any {
    const recommendations = {
      highDemand: [] as string[],
      niche: [] as string[],
      trending: [] as string[],
    };
    
    // Find top 3 industries
    const topIndustries = Object.entries(industries)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([industry]) => industry);
    
    // Find top seniority levels
    const topSeniority = Object.entries(seniority)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([level]) => level);
    
    // Industry-specific recommendations
    const industryRecommendations: Record<string, string[]> = {
      'Technology': [
        'Programming Best Practices Guide',
        'Tech Leadership Framework',
        'AI Implementation Strategies',
        'Software Architecture Templates',
        'DevOps Workflow Optimization'
      ],
      'Finance': [
        'Investment Strategy Template',
        'Financial Modeling Toolkit',
        'Wealth Management Guide',
        'Risk Assessment Framework',
        'FinTech Adoption Strategies'
      ],
      'Marketing': [
        'Content Marketing Playbook',
        'Social Media Strategy Kit',
        'Brand Positioning Framework',
        'Marketing Analytics Dashboard',
        'Customer Journey Mapping Tool'
      ],
      'Healthcare': [
        'Patient Experience Optimization',
        'Healthcare Innovation Guide',
        'Medical Practice Management',
        'Healthcare Data Analysis',
        'Wellness Program Framework'
      ],
      'Education': [
        'Curriculum Development Template',
        'E-Learning Best Practices',
        'Student Engagement Strategies',
        'Educational Assessment Tools',
        'Teaching Methodology Guide'
      ],
      'Consulting': [
        'Client Engagement Framework',
        'Consulting Methodology Template',
        'Problem-Solving Toolkit',
        'Business Analysis Templates',
        'Project Management Dashboard'
      ],
    };
    
    // Seniority-specific recommendations
    const seniorityRecommendations: Record<string, string[]> = {
      'C-level': [
        'Executive Decision Framework',
        'Strategic Planning Template',
        'Board Communication Guide',
        'Corporate Vision Development',
        'Leadership Legacy Blueprint'
      ],
      'Executive': [
        'Team Scaling Playbook',
        'Executive Presence Workshop',
        'Strategic Influence Guide',
        'Organizational Design Framework',
        'Change Management Toolkit'
      ],
      'Director': [
        'Department Strategy Template',
        'Cross-Functional Collaboration Guide',
        'Performance Optimization Framework',
        'Budget Management Tools',
        'Team Development Blueprint'
      ],
      'Manager': [
        'Team Leadership Handbook',
        'Performance Review Framework',
        'Project Prioritization Guide',
        'Conflict Resolution Strategies',
        'Productivity Maximization Tools'
      ],
      'Senior': [
        'Career Advancement Strategies',
        'Technical Leadership Guide',
        'Mentoring Framework',
        'Innovation Toolkit',
        'Expertise Monetization Guide'
      ],
      'Junior': [
        'Career Development Roadmap',
        'Skill Acquisition Framework',
        'Productivity Optimization Guide',
        'Professional Growth Strategies',
        'Personal Branding Toolkit'
      ]
    };
    
    // Generate high demand recommendations
    topIndustries.forEach(industry => {
      if (industryRecommendations[industry]) {
        recommendations.highDemand.push(...industryRecommendations[industry].slice(0, 2));
      }
    });
    
    topSeniority.forEach(level => {
      if (seniorityRecommendations[level]) {
        recommendations.highDemand.push(...seniorityRecommendations[level].slice(0, 2));
      }
    });
    
    // Generate niche recommendations
    const niches = Object.entries(industries)
      .filter(([_, percentage]) => percentage > 5 && percentage < 15)
      .map(([industry]) => industry);
    
    niches.forEach(industry => {
      if (industryRecommendations[industry]) {
        recommendations.niche.push(industryRecommendations[industry][0]);
      }
    });
    
    // Add some generic trending recommendations
    recommendations.trending = [
      'AI for LinkedIn Optimization',
      'Personal Brand Acceleration',
      'Digital Product Launch Playbook',
      "Content Creator's Monetization Guide",
      'Data-Driven Decision Making Framework'
    ];
    
    // Ensure no duplicates and limit each category
    recommendations.highDemand = [...new Set(recommendations.highDemand)].slice(0, 5);
    recommendations.niche = [...new Set(recommendations.niche)].slice(0, 3);
    recommendations.trending = [...new Set(recommendations.trending)].slice(0, 5);
    
    return recommendations;
  }
  
  /**
   * Get saved analytics for a user
   */
  async getAnalytics(userId: string): Promise<any> {
    try {
      const analytics = await LinkedInAnalytics.findOne({ userId });
      
      if (!analytics) {
        throw new Error('No analytics found for this user');
      }
      
      return analytics;
    } catch (error) {
      console.error('Error fetching LinkedIn analytics:', error);
      throw error;
    }
  }
}

export default LinkedInService; 