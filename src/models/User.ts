import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  socialAccounts: Array<{
    platform: string;
    username: string;
    accountId?: string;
    followers?: number;
    followersData?: any;
    lastUpdated?: Date;
  }>;
}

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
      }
    ],
  },
  { timestamps: true }
);

// Check if model already exists to prevent model overwrite error
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 