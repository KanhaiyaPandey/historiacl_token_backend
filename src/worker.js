import 'dotenv/config';
import mongoose from 'mongoose';
import { Worker } from 'bullmq';
import { redis } from './redis/redisClient.js';
import { getInterpolatedPrice } from '../src/services/interpolatePrice.js';


const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB connected in worker');

  // Only create the worker *after* MongoDB is connected
  const worker = new Worker('priceQueue', async job => {
    const { token, network, timestamp } = job.data;

    try {
      const price = await getInterpolatedPrice(token, network, timestamp, true);
      console.log(`✅ Job done: Interpolated price = ${price}`);
    } catch (err) {
      console.error('❌ Interpolation failed:', err.message);
    }
  }, {
    connection: {
      ...redis.options,
      maxRetriesPerRequest: null,
    },
  });

  worker.on('completed', job => {
    console.log(`✅ Job completed: ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Job failed: ${job?.id}`, err);
  });

}).catch(err => {
  console.error('❌ MongoDB connection failed in worker:', err.message);
});
