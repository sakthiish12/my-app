import mongoose, { Schema, Document } from 'mongoose';

// Interface for social account data
export interface SocialAccount {
  platform: string;
  platformId: string;
  username: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  profileData?: any;
  followersData?: any;
  lastUpdated: Date;
}

// Interface for user document
export interface UserDocument extends Document {
  clerkId: string;
  email: string;
  name: string;
  socialAccounts: SocialAccount[];
  createdAt: Date;
  updatedAt: Date;
}

// Schema for social accounts
const socialAccountSchema = new Schema<SocialAccount>({
  platform: { type: String, required: true },
  platformId: { type: String, required: true },
  username: { type: String, required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String },
  tokenExpiry: { type: Date },
  profileData: { type: Schema.Types.Mixed },
  followersData: { type: Schema.Types.Mixed },
  lastUpdated: { type: Date, default: Date.now }
});

// Schema for user
const userSchema = new Schema<UserDocument>({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  socialAccounts: [socialAccountSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create the model
const UserModel = mongoose.models.User || mongoose.model<UserDocument>('User', userSchema);

export default UserModel; 