import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ILinkedInAnalytics extends Document {
  userId: string;
  totalFollowers: number;
  
  // Demographic data
  industries: Record<string, number>;
  locations: Record<string, number>;
  companies: Record<string, number>;
  jobTitles: Record<string, number>;
  seniority: Record<string, number>;
  
  // Pricing recommendations
  recommendedPricing: {
    digitalProducts: {
      ebook: {
        min: number;
        max: number;
        optimal: number;
      };
      onlineCourse: {
        min: number;
        max: number;
        optimal: number;
      };
      template: {
        min: number;
        max: number;
        optimal: number;
      };
      coaching: {
        min: number;
        max: number;
        optimal: number;
        hourly: number;
      };
      membership: {
        min: number;
        max: number;
        optimal: number;
      };
    };
    
    premiumTiers: {
      basic: {
        price: number;
        features: string[];
      };
      professional: {
        price: number;
        features: string[];
      };
      enterprise: {
        price: number;
        features: string[];
      };
    };
  };
  
  // Product recommendations
  productRecommendations: {
    highDemand: string[];
    niche: string[];
    trending: string[];
  };
  
  // Last updated timestamp
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LinkedInAnalyticsSchema = new Schema<ILinkedInAnalytics>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    totalFollowers: {
      type: Number,
      required: true,
    },
    
    // Demographic data
    industries: {
      type: Map,
      of: Number,
      default: {},
    },
    locations: {
      type: Map,
      of: Number,
      default: {},
    },
    companies: {
      type: Map,
      of: Number,
      default: {},
    },
    jobTitles: {
      type: Map,
      of: Number,
      default: {},
    },
    seniority: {
      type: Map,
      of: Number,
      default: {},
    },
    
    // Pricing recommendations
    recommendedPricing: {
      digitalProducts: {
        ebook: {
          min: Number,
          max: Number,
          optimal: Number,
        },
        onlineCourse: {
          min: Number,
          max: Number,
          optimal: Number,
        },
        template: {
          min: Number,
          max: Number,
          optimal: Number,
        },
        coaching: {
          min: Number,
          max: Number,
          optimal: Number,
          hourly: Number,
        },
        membership: {
          min: Number,
          max: Number,
          optimal: Number,
        },
      },
      
      premiumTiers: {
        basic: {
          price: Number,
          features: [String],
        },
        professional: {
          price: Number,
          features: [String],
        },
        enterprise: {
          price: Number,
          features: [String],
        },
      },
    },
    
    // Product recommendations
    productRecommendations: {
      highDemand: [String],
      niche: [String],
      trending: [String],
    },
    
    // Last updated timestamp
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create the model
const LinkedInAnalytics: Model<ILinkedInAnalytics> = 
  mongoose.models.LinkedInAnalytics as Model<ILinkedInAnalytics> || 
  mongoose.model<ILinkedInAnalytics>('LinkedInAnalytics', LinkedInAnalyticsSchema);

export default LinkedInAnalytics; 