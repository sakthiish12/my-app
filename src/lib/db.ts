import mongoose from 'mongoose';

// Declare global variables to cache the connection
declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// Initialize global mongoose object if it doesn't exist
if (!global.mongoose) {
  global.mongoose = {
    conn: null,
    promise: null,
  };
}

/**
 * Connect to MongoDB using Mongoose
 */
async function connectToDatabase(): Promise<typeof mongoose | null> {
  try {
    // If we already have a connection, return it
    if (global.mongoose.conn) {
      return global.mongoose.conn;
    }

    // If a connection is in progress, return the promise
    if (!global.mongoose.promise) {
      const MONGODB_URI = process.env.MONGODB_URI;

      if (!MONGODB_URI) {
        console.error('Please define the MONGODB_URI environment variable');
        return null;
      }

      // Set up mongoose connection with best practices
      const options = {
        autoIndex: true, // Build indexes
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      };

      // Create new promise for the connection
      global.mongoose.promise = mongoose.connect(MONGODB_URI, options)
        .then((mongoose) => {
          console.log('Connected to MongoDB');
          return mongoose;
        })
        .catch((error) => {
          console.error('Error connecting to MongoDB:', error);
          global.mongoose.promise = null;
          throw error;
        });
    }

    // Store the connection and return it
    global.mongoose.conn = await global.mongoose.promise;
    return global.mongoose.conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return null;
  }
}

export default connectToDatabase; 