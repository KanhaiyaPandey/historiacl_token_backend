import { TokenPrice } from '../models/TokenPrice.js';
import { redis } from '../redis/redisClient.js';

export const getInterpolatedPrice = async (token, network, timestamp, saveToDB = true, useCache = true) => {
  const cacheKey = `price:${token}:${network}:${timestamp}`;

  // Check Redis cache first
  if (useCache) {
    const cached = await redis.get(cacheKey);
    if (cached !== null) {
      console.log(`📦 Returned from cache: ₹${cached}`);
      return parseFloat(cached);
    }
  }

  // Exact match exists in DB
  const exact = await TokenPrice.findOne({ token, network, timestamp });
  if (exact) {

    if (useCache) {
      await redis.set(cacheKey, exact.price.toString(), 'EX', 3600); 
    }
    return exact.price;
  }


  const older = await TokenPrice.findOne({ token, network, timestamp: { $lt: timestamp } }).sort({ timestamp: -1 });
  const newer = await TokenPrice.findOne({ token, network, timestamp: { $gt: timestamp } }).sort({ timestamp: 1 });

  if (!older || !newer) throw new Error('Not enough data to interpolate');

  const t1 = older.timestamp, p1 = older.price;
  const t2 = newer.timestamp, p2 = newer.price;


  const interpolatedPrice = p1 + ((timestamp - t1) * (p2 - p1)) / (t2 - t1);


  if (saveToDB) {
    await TokenPrice.create({ token, network, timestamp, price: interpolatedPrice });
    console.log(`Saved interpolated price for ${token} at ${timestamp}: ₹${interpolatedPrice}`);
  }

  if (useCache) {
    await redis.set(cacheKey, interpolatedPrice.toString(), 'EX', 3600); // 1 hour TTL
    console.log(`Cached interpolated price for ${cacheKey}`);
  }

  return interpolatedPrice;
};
