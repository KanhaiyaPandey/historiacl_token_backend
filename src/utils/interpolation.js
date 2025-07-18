import { TokenPrice } from '../models/TokenPrice.js';
import redis from '../config/redis.js';

export const getInterpolatedPrice = async (token, network, timestamp, saveToDB = true) => {
  const cacheKey = `price:${token}:${network}:${timestamp}`;
  const cached = await redis.get(cacheKey);
  if (cached) return { price: parseFloat(cached), source: 'cache' };

  const exact = await TokenPrice.findOne({ token, network, timestamp });
  if (exact) {
    await redis.set(cacheKey, exact.price, 'EX', 300); // 5 min TTL
    return { price: exact.price, source: 'alchemy' };
  }

  const older = await TokenPrice.findOne({ token, network, timestamp: { $lt: timestamp } }).sort({ timestamp: -1 });
  const newer = await TokenPrice.findOne({ token, network, timestamp: { $gt: timestamp } }).sort({ timestamp: 1 });

  if (!older || !newer) throw new Error('No data available for interpolation');

  const interpolatedPrice =
    older.price + ((timestamp - older.timestamp) * (newer.price - older.price)) / (newer.timestamp - older.timestamp);

  if (saveToDB) {
    await TokenPrice.create({ token, network, timestamp, price: interpolatedPrice });
    console.log(`📝 Saved interpolated price for ${token} at ${timestamp}: ₹${interpolatedPrice}`);
  }

  await redis.set(cacheKey, interpolatedPrice, 'EX', 300);
  return { price: interpolatedPrice, source: 'interpolated' };
};
