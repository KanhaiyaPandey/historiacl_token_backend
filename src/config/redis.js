// src/config/redis.js
import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redisUrl = process.env.REDIS_URL;

export const redisConnection = new Redis(redisUrl, {
  tls: {},
  maxRetriesPerRequest: null, // Required by BullMQ
});

// BullMQ connection options
export const bullConnectionOptions = {
  redis: {
    maxRetriesPerRequest: null,
  },
};

redisConnection.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redisConnection.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

// Redis cache helper functions
export const getCachedPrice = async (key) => {
  return await redisConnection.get(key);
};

export const setCachedPrice = async (key, value, ttl = 300) => {
  await redisConnection.set(key, value, 'EX', ttl); // 5 min TTL
};
