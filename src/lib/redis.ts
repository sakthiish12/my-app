import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL as string;

if (!REDIS_URL) {
  throw new Error('Please define the REDIS_URL environment variable');
}

let redisClient: any = null;

export async function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  redisClient = createClient({
    url: REDIS_URL,
  });

  redisClient.on('error', (err: any) => {
    console.error('Redis client error:', err);
  });

  await redisClient.connect();
  return redisClient;
}

export async function disconnect() {
  if (redisClient) {
    await redisClient.disconnect();
    redisClient = null;
  }
} 