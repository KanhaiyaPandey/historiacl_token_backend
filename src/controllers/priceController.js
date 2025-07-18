import TokenPrice from '../models/TokenPrice.js';
import { getCachedPrice, setCachedPrice } from '../config/redis.js';
import { getPriceFromAlchemy, getTokenCreationTimestamp } from '../services/alchemyService.js';
import {interpolatePrice} from '../services/interpolationService.js';
import {priceQueue} from '../queues/priceQueue.js';
import dayjs from 'dayjs';

// GET /price
export const getTokenPrice = async (req, res) => {
  try {
    const token = req.body.token;
    const network = req.body.network;
    const timestamp = Number(req.body.timestamp);

    console.log('🔍 Timestamp type:', typeof timestamp, 'value:', timestamp);

    if (!token || !network || isNaN(timestamp)) {
  return res.status(400).json({ error: 'Invalid input data' });
}

    const cacheKey = `price:${token}:${network}:${timestamp}`;
    const cached = await getCachedPrice(cacheKey);
    if (cached) {
      return res.json({ price: parseFloat(cached), source: 'cache' });
    }

    // Look for exact price in DB
    const exactPrice = await TokenPrice.findOne({ token, network, timestamp });
    if (exactPrice) {
      await setCachedPrice(cacheKey, exactPrice.price);
      return res.json({ price: exactPrice.price, source: 'alchemy' });
    }

    // Look for nearest timestamps for interpolation
    const before = await TokenPrice.findOne({ token, network, timestamp: { $lt: timestamp } })
      .sort({ timestamp: -1 });


    const after = await TokenPrice.findOne({ token, network, timestamp: { $gt: timestamp } })
      .sort({ timestamp: 1 });

    if (before && after) {
      const interpolated = interpolatePrice(timestamp, before.timestamp, before.price, after.timestamp, after.price);
      await setCachedPrice(cacheKey, interpolated);
      return res.json({ price: interpolated, source: 'interpolated' });
    }

    const alchemyPrice = await getPriceFromAlchemy(token, network, timestamp);

    if (alchemyPrice !== null) {
      await TokenPrice.create({ token, network, timestamp,  price: alchemyPrice.price, });
      await setCachedPrice(cacheKey, alchemyPrice.price);
      return res.json({ price: alchemyPrice, source: 'alchemy' });
    }


    return res.status(404).json({ error: 'No data available for interpolation' });
  } catch (error) {
    console.error('Error fetching price:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// POST /schedule
export const schedulePriceHistory = async (req, res) => {
  try {
    const { token, network } = req.body;

    const creationTimestamp = await getTokenCreationTimestamp(token, network);
    if (!creationTimestamp) {
      return res.status(400).json({ error: 'Unable to determine token creation timestamp' });
    }

    // Enqueue BullMQ job
    await priceQueue.add('fetch-history', { token, network, creationTimestamp });

    return res.json({ message: 'Price history fetch scheduled', from: creationTimestamp });
  } catch (error) {
    console.error('Error scheduling price history:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};




// full history

export const scheduleFullHistory = async (req, res) => {
  try {
    const { token, network } = req.body;

    if (!token || !network) {
      return res.status(400).json({ error: 'Token and network are required.' });
    }

    const creationTimestamp = await getTokenCreationTimestamp(token, network);
    const now = Math.floor(Date.now() / 1000);

    const jobs = [];

    for (let ts = creationTimestamp; ts <= now; ts += 86400) {
      jobs.push({
        name: `fetch-${token}-${ts}`,
        data: { token, network, timestamp: ts },
      });
    }

    await priceQueue.addBulk(
      jobs.map(job => ({
        name: job.name,
        data: job.data,
      }))
    );

    return res.json({
      message: `Scheduled ${jobs.length} daily price jobs from ${dayjs(creationTimestamp * 1000).format()} to ${dayjs(now * 1000).format()}`,
    });
  } catch (err) {
    console.error('❌ Error scheduling full history:', err);
    return res.status(500).json({ error: 'Failed to schedule full history' });
  }
};

