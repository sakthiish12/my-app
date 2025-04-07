import axios from 'axios';

export interface PhantomBusterConfig {
  apiKey: string;
  phantomId: string; // ID of the specific phantom to launch
  params?: Record<string, any>; // Custom arguments to pass to the phantom
}

export interface LinkedInFollowerData {
  name: string;
  headline: string;
  profileUrl: string;
  location: string;
  industry?: string;
  company?: string;
  position?: string;
  connectionDegree?: string;
  profileImageUrl?: string;
  customData?: Record<string, any>;
}

export class PhantomBusterService {
  private apiKey: string;
  private baseUrl = 'https://api.phantombuster.com/api/v2';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  /**
   * Launch a PhantomBuster phantom to scrape data
   */
  async launchPhantom(phantomId: string, params?: Record<string, any>): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/agents/launch`,
        {
          id: phantomId,
          arguments: JSON.stringify(params || {})
        },
        {
          headers: {
            'X-Phantombuster-Key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error launching PhantomBuster phantom:', error);
      throw error;
    }
  }
  
  /**
   * Get the container status and result URL
   */
  async getContainerStatus(containerId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/containers/fetch-result`,
        {
          params: { id: containerId },
          headers: { 'X-Phantombuster-Key': this.apiKey }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching container status:', error);
      throw error;
    }
  }
  
  /**
   * Fetch LinkedIn followers data using LinkedIn Followers Extractor phantom
   */
  async fetchLinkedInFollowers(linkedinProfileUrl: string): Promise<LinkedInFollowerData[]> {
    try {
      // Use configured API key to launch PhantomBuster
      const phantomId = 'linkedin-followers-extractor';
      
      // Get LinkedIn session cookie from environment
      const sessionCookie = process.env.LINKEDIN_SESSION_COOKIE;
      
      if (!sessionCookie) {
        throw new Error('LinkedIn session cookie not found in environment variables. Real data extraction requires a valid LinkedIn session cookie.');
      }
      
      const params = {
        sessionCookie,
        spreadsheetUrl: linkedinProfileUrl,
        numberOfFollowersToScrape: 1000
      };
      
      const launchResult = await this.launchPhantom(phantomId, params);
      
      // Wait for phantom to complete
      const maxAttempts = 10;
      let attempt = 0;
      let containerResult = null;
      
      while (attempt < maxAttempts) {
        const status = await this.getContainerStatus(launchResult.containerId);
        
        if (status.status === 'finished') {
          containerResult = status;
          break;
        }
        
        // Wait 30 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 30000));
        attempt++;
      }
      
      if (!containerResult || !containerResult.resultUrl) {
        throw new Error('Phantom execution timed out or failed');
      }
      
      // Download and parse the results
      const resultsResponse = await axios.get(containerResult.resultUrl);
      return resultsResponse.data as LinkedInFollowerData[];
      
    } catch (error) {
      console.error('Error fetching LinkedIn followers:', error);
      throw error;
    }
  }
  
  /**
   * Analyze LinkedIn follower data to extract demographic insights
   */
  analyzeFollowerDemographics(followers: LinkedInFollowerData[]): Record<string, any> {
    // Initialize counters
    const industries: Record<string, number> = {};
    const locations: Record<string, number> = {};
    const companies: Record<string, number> = {};
    const jobTitles: Record<string, number> = {};
    const seniority: Record<string, number> = {};
    
    // Process each follower
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
      
      // Analyze job titles for seniority
      if (follower.position) {
        jobTitles[follower.position] = (jobTitles[follower.position] || 0) + 1;
        
        // Extract seniority from job title
        const position = follower.position.toLowerCase();
        let seniorityLevel = 'Other';
        
        if (position.includes('senior') || position.includes('sr') || position.includes('lead')) {
          seniorityLevel = 'Senior';
        } else if (position.includes('manager') || position.includes('head')) {
          seniorityLevel = 'Manager';
        } else if (position.includes('director') || position.includes('vp') || position.includes('chief')) {
          seniorityLevel = 'Executive';
        } else if (position.includes('junior') || position.includes('jr') || position.includes('associate')) {
          seniorityLevel = 'Junior';
        } else if (position.includes('intern') || position.includes('trainee')) {
          seniorityLevel = 'Entry';
        }
        
        seniority[seniorityLevel] = (seniority[seniorityLevel] || 0) + 1;
      }
    });
    
    // Calculate percentages
    const totalFollowers = followers.length;
    
    return {
      totalFollowers,
      industries: this.convertToPercentages(industries, totalFollowers),
      locations: this.convertToPercentages(locations, totalFollowers),
      companies: this.convertToPercentages(companies, totalFollowers),
      jobTitles: this.convertToPercentages(jobTitles, totalFollowers),
      seniority: this.convertToPercentages(seniority, totalFollowers),
      rawData: {
        industries,
        locations,
        companies,
        jobTitles,
        seniority
      }
    };
  }
  
  /**
   * Calculate percentages for each category
   */
  private convertToPercentages(data: Record<string, number>, total: number): Record<string, number> {
    const percentages: Record<string, number> = {};
    
    for (const [key, count] of Object.entries(data)) {
      percentages[key] = Number(((count / total) * 100).toFixed(2));
    }
    
    return percentages;
  }
}

export default PhantomBusterService; 