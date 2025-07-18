import mongoose from 'mongoose';
import { createClient } from 'redis';
import app from './app.js';
import { connectMongo } from './config/mongo.js';
import './config/redis.js'; // ensure Redis client connects

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectMongo();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();
