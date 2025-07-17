import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

export const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

redis.on('connect', () => {
  console.log('✅ Redis connected (ioredis)');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});
