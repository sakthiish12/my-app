import mongoose, { Schema, Document } from 'mongoose';

// Define the structure for the LinkedIn OAuth data
interface ILinkedInAuth {
  accessToken: string;
  expiresIn: number; // Seconds until expiry
  lastUpdated: Date;
  // Add fields for refresh token if needed later
  // refreshToken?: string;
  // refreshTokenExpiresIn?: number; 
}

export interface IUser extends Document {
  clerkId: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  // Keep existing social accounts structure for potentially other data
  socialAccounts: Array<{
    platform: string;
    username: string;
    accountId?: string;
    followers?: number;
    followersData?: any;
    lastUpdated?: Date;
  }>;
  // Add dedicated field for LinkedIn OAuth details
  linkedin?: ILinkedInAuth;
}

const LinkedInAuthSchema: Schema = new Schema({
  accessToken: { type: String, required: true },
  expiresIn: { type: Number, required: true },
  lastUpdated: { type: Date, required: true },
  // refreshToken: { type: String },
  // refreshTokenExpiresIn: { type: Number },
}, { _id: false }); // No separate ID for this subdocument

const UserSchema: Schema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    socialAccounts: [
      {
        platform: { type: String, required: true },
        username: { type: String, required: true },
        accountId: { type: String },
        followers: { type: Number },
        followersData: { type: Schema.Types.Mixed },
        lastUpdated: { type: Date }
        // _id: false // Ensure no IDs for array subdocuments if not needed
      }
    ],
    // Add the linkedin subdocument to the main schema
    linkedin: { type: LinkedInAuthSchema, required: false }, 
  },
  { timestamps: true }
);

// Check if model already exists to prevent model overwrite error
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 