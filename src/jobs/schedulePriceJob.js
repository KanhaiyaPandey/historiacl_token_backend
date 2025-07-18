import TokenPrice from '../models/TokenPrice.js';
import { getAlchemyInstance } from '../services/alchemyService.js';
import { getPriceFromAlchemy, getTokenCreationTimestamp } from '../services/alchemyService.js';
import { linearInterpolation } from '../services/interpolationService.js';
import pRetry from 'p-retry';

// Utility: convert date to Unix timestamp at 00:00:00 UTC
const getDailyTimestamps = (start, end) => {
  const timestamps = [];
  const current = new Date(start);
  current.setUTCHours(0, 0, 0, 0);

  while (current <= end) {
    timestamps.push(Math.floor(current.getTime() / 1000));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return timestamps;
};


// process job

export const processPriceJob = async (job) => {
  const { token, network, timestamp } = job.data;
  console.log(`🧮 Processing job: ${job.name} | Token: ${token}, Network: ${network}, Timestamp: ${timestamp}`);

  if (!timestamp) {
    throw new Error('timestamp is required in job data');
  }

  const existing = await TokenPrice.findOne({ token, timestamp });
  if (existing) {
    console.log(`📦 Price already exists for ${token} at ${timestamp}, skipping...`);
    return;
  }

  // Try to fetch price from Alchemy (replace with actual logic)
  let priceData = await getPriceFromAlchemy(token, network, timestamp);

  // If real price is not available (e.g. null), interpolate
  if (!priceData?.price) {
    console.log(`📉 No price found from Alchemy for ${timestamp}, attempting interpolation...`);

    const before = await TokenPrice.findOne({ token, timestamp: { $lt: timestamp } }).sort({ timestamp: -1 });
    const after = await TokenPrice.findOne({ token, timestamp: { $gt: timestamp } }).sort({ timestamp: 1 });

    if (before && after) {
      const interpolatedPrice = linearInterpolation(before.timestamp, before.price, after.timestamp, after.price, timestamp);
      priceData = { price: interpolatedPrice };
      console.log(`📈 Interpolated price: $${interpolatedPrice}`);
    } else {
      console.log(`⚠️ Not enough data to interpolate price for ${timestamp}`);
      return;
    }
  }

  // Save the price (real or interpolated)
  const saved = await TokenPrice.create({
    token,
    network,
    timestamp,
    price: priceData.price,
  });

  console.log(`✅ Stored price: ${saved.price} for ${token} at ${timestamp}`);
};



export const schedulePriceJob = async (job) => {
  const { token, network } = job.data;

  try {
    const alchemy = getAlchemyInstance(network);

    // Get token creation date (first transfer)
    const transfers = await pRetry(() =>
      alchemy.core.getAssetTransfers({
        category: ['erc20'],
        contractAddresses: [token],
        order: 'asc',
        maxCount: 1,
        withMetadata: true
      }), { retries: 5 });

    if (!transfers?.transfers?.length) {
      throw new Error('Token creation date not found');
    }

    const creationDate = new Date(transfers.transfers[0].metadata.blockTimestamp);
    const today = new Date();

    const dailyTimestamps = getDailyTimestamps(creationDate, today);

    for (const ts of dailyTimestamps) {
      // Check if already exists
      const exists = await TokenPrice.findOne({ token, network, timestamp: ts });
      if (exists) continue;

      // Fetch price at this timestamp
      const priceData = await pRetry(() =>
        alchemy.core.getTokenMetadata({ address: token })
          .then(() => alchemy.core.getTokenBalances('0x000000000000000000000000000000000000dead', [token])) // dummy fetch to force rate limit wait
          .then(() => ({
            price: Math.random() * 10 + 1 // 🧪 mock price — replace with actual pricing logic/API
          })), { retries: 5 });

      const newPrice = new TokenPrice({ token, network, timestamp: ts, price: priceData.price });
      await newPrice.save();
    }

    return { message: `Scheduled price history fetched for ${token} on ${network}` };
  } catch (err) {
    console.error('Job error:', err);
    throw err;
  }
};
