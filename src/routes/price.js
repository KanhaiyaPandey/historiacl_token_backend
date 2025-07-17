import express from 'express';
import { redis } from '../services/redis.js';
import Price from '../models/Price.js';
import { interpolate } from '../utils/interpolate.js';

const router = express.Router();

// POST /api/price
router.post('/price', async (req, res) => {
  try {
    const { token, network, timestamp } = req.body;

    if (!token || !network || !timestamp) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const cacheKey = `${token}:${network}:${timestamp}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return res.json({ price: parseFloat(cached), source: 'cache' });
    }

    const exact = await Price.findOne({ token, network, timestamp });

    if (exact) {
      await redis.setex(cacheKey, 300, exact.price); // TTL 5 min
      return res.json({ price: exact.price, source: 'alchemy' });
    }

    // Interpolation: find closest before and after
    const before = await Price.findOne({
      token,
      network,
      timestamp: { $lt: timestamp },
    }).sort({ timestamp: -1 });

    const after = await Price.findOne({
      token,
      network,
      timestamp: { $gt: timestamp },
    }).sort({ timestamp: 1 });

    if (!before || !after) {
      return res.status(404).json({ error: 'No data available for interpolation' });
    }

    const interpolatedPrice = interpolate(
      timestamp,
      before.timestamp,
      before.price,
      after.timestamp,
      after.price
    );

    await redis.setex(cacheKey, 300, interpolatedPrice);

    return res.json({ price: interpolatedPrice, source: 'interpolated' });
  } catch (err) {
    console.error('Error in /price', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
