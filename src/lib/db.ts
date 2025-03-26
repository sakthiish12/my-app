import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;
const isProd = process.env.NODE_ENV === 'production';

// Only require MongoDB URI in production or if explicitly provided
if (isProd && !MONGODB_URI) {
  console.warn('MongoDB URI not defined. Some functionality will be limited.');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// @ts-ignore - global augmentation
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  // @ts-ignore - global augmentation
  global.mongoose = cached;
}

async function connectToDatabase() {
  // Return early if no MongoDB URI is provided
  if (!MONGODB_URI) {
    console.warn('No MongoDB URI provided. Database operations will fail.');
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(() => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase; 