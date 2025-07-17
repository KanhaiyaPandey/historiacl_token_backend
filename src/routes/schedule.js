// src/routes/schedule.js
import express from 'express';
import { redis } from '../redis/redisClient.js';
import { priceQueue } from '../queue/jobQueue.js';


const router = express.Router();


router.post('/', async (req, res) => {
  const { token, network, timestamp } = req.body;

  if (!token || !network || !timestamp) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const cacheKey = `tokenPrice:${network}:${token}:${timestamp}`;

  try {
    // Check Redis cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("✅ Served from cache");
      return res.status(200).json(JSON.parse(cached));
    }

    // If not in cache, schedule job
    await priceQueue.add('priceJob', { token, network, timestamp });
    res.status(200).json({ message: 'Job scheduled' });
  } catch (err) {
    console.error('Failed to schedule job:', err);
    res.status(500).json({ message: 'Failed to schedule job' });
  }
});

export default router;
