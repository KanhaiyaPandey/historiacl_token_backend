import Redis from 'ioredis';

export let redis;

export const initRedis = async () => {
  redis = new Redis(process.env.REDIS_URL);
  redis.on('connect', () => console.log('✅ Redis connected'));
  redis.on('error', (err) => console.error('❌ Redis error', err));
};
