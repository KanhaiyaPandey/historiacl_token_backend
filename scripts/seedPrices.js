import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { TokenPrice } from '../src/models/TokenPrice.js';

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const token = '0xABC123';
  const network = 'polygon';

  const prices = [
    { timestamp: 1679040000, price: 10 },
    { timestamp: 1679050000, price: 12 },
    { timestamp: 1679060000, price: 14 },
  ];

  await TokenPrice.deleteMany({ token, network });

  for (const p of prices) {
    await TokenPrice.create({ token, network, ...p });
    console.log(`➕ Inserted ${p.timestamp} : ${p.price}`);
  }

  console.log('🌱 Seeding done');
  process.exit(0);
};

seed();
