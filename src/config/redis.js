// src/config/redis.js
import Redis from 'ioredis';

 export const redisConnection = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // ✅ This is required by BullMQ
});

// For BullMQ queues & workers (use this)
export const bullConnectionOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
};


export const getCachedPrice = async (key) => {
  return await redisConnection.get(key);
};

export const setCachedPrice = async (key, value, ttl = 300) => {
  await redisConnection.set(key, value, 'EX', ttl); // 5 min TTL
};


