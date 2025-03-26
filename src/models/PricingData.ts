import mongoose, { Schema, Document } from 'mongoose';

export interface IPricingData extends Document {
  userId: string;
  socialPlatform: string;
  productType: string;
  recommendedPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  followerCount: number;
  demographicBreakdown: any;
  conversionRatePrediction: number;
  createdAt: Date;
  updatedAt: Date;
}

const PricingDataSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    socialPlatform: { type: String, required: true },
    productType: { type: String, required: true },
    recommendedPrice: { type: Number, required: true },
    priceRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    followerCount: { type: Number, required: true },
    demographicBreakdown: { type: Schema.Types.Mixed },
    conversionRatePrediction: { type: Number },
  },
  { timestamps: true }
);

// Create a compound index for userId, socialPlatform, and productType
PricingDataSchema.index(
  { userId: 1, socialPlatform: 1, productType: 1 },
  { unique: true }
);

// Check if model already exists to prevent model overwrite error
export default mongoose.models.PricingData || mongoose.model<IPricingData>('PricingData', PricingDataSchema); 