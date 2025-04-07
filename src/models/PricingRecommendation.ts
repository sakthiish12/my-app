import mongoose, { Document, Schema } from 'mongoose';

export interface PricePoint {
  amount: number;
  conversionRate: number;
  confidence: number;
}

export interface ProductSegment {
  name: string;
  description: string;
  demographicTarget: {
    age?: Record<string, number>;
    gender?: Record<string, number>;
    location?: Record<string, number>;
    interests?: Record<string, number>;
    income?: Record<string, number>;
  };
  recommendedPrices: PricePoint[];
}

export interface PricingRecommendationDocument extends Document {
  userId: string;
  productName: string;
  productDescription: string;
  productType: string;
  productCost?: number;
  targetMargin?: number;
  segments: ProductSegment[];
  platforms: string[];
  createdAt: Date;
  updatedAt: Date;
}

const pricePointSchema = new Schema<PricePoint>({
  amount: { type: Number, required: true },
  conversionRate: { type: Number, required: true },
  confidence: { type: Number, required: true }
});

const productSegmentSchema = new Schema<ProductSegment>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  demographicTarget: {
    age: { type: Map, of: Number },
    gender: { type: Map, of: Number },
    location: { type: Map, of: Number },
    interests: { type: Map, of: Number },
    income: { type: Map, of: Number }
  },
  recommendedPrices: [pricePointSchema]
});

const pricingRecommendationSchema = new Schema<PricingRecommendationDocument>({
  userId: { type: String, required: true, index: true },
  productName: { type: String, required: true },
  productDescription: { type: String, required: true },
  productType: { type: String, required: true },
  productCost: { type: Number },
  targetMargin: { type: Number },
  segments: [productSegmentSchema],
  platforms: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
pricingRecommendationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const PricingRecommendationModel = mongoose.models.PricingRecommendation || 
  mongoose.model<PricingRecommendationDocument>('PricingRecommendation', pricingRecommendationSchema);

export default PricingRecommendationModel; 