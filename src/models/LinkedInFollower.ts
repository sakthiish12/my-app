import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ILinkedInFollower extends Document {
  userId: string;
  name: string;
  headline: string;
  profileUrl: string;
  location: string;
  industry?: string;
  company?: string;
  position?: string;
  connectionDegree?: string;
  profileImageUrl?: string;
  estimatedIncome?: string;
  purchasingPower?: string;
  engagementLevel?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LinkedInFollowerSchema = new Schema<ILinkedInFollower>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    headline: {
      type: String,
      required: true,
    },
    profileUrl: {
      type: String,
      required: true,
      unique: true,
    },
    location: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
    },
    company: {
      type: String,
    },
    position: {
      type: String,
    },
    connectionDegree: {
      type: String,
    },
    profileImageUrl: {
      type: String,
    },
    estimatedIncome: {
      type: String,
    },
    purchasingPower: {
      type: String,
    },
    engagementLevel: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
LinkedInFollowerSchema.index({ userId: 1, industry: 1 });
LinkedInFollowerSchema.index({ userId: 1, location: 1 });
LinkedInFollowerSchema.index({ userId: 1, company: 1 });
LinkedInFollowerSchema.index({ userId: 1, position: 1 });

// Create compound indexes for analytics queries
LinkedInFollowerSchema.index({ userId: 1, industry: 1, position: 1 });
LinkedInFollowerSchema.index({ userId: 1, estimatedIncome: 1 });
LinkedInFollowerSchema.index({ userId: 1, purchasingPower: 1 });

// Check if the model already exists to prevent recompiling during hot reload
const LinkedInFollower: Model<ILinkedInFollower> = 
  mongoose.models.LinkedInFollower as Model<ILinkedInFollower> || 
  mongoose.model<ILinkedInFollower>('LinkedInFollower', LinkedInFollowerSchema);

export default LinkedInFollower; 