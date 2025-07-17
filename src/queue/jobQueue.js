import { Queue } from 'bullmq';
import { redis } from '../redis/redisClient.js';

export const priceQueue = new Queue('priceQueue', {
  connection: redis,
});
