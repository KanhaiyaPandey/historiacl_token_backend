import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';

import { connectMongo } from './services/mongo.js';
import { initRedis } from './services/redis.js';
import priceRoutes from './routes/price.js';



dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

await connectMongo();
await initRedis();

app.use('/api', priceRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
