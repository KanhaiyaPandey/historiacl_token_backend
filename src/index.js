import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';

import { connectMongo } from './services/mongo.js';
import { initRedis } from './services/redis.js';
import priceRoutes from './routes/price.js';
import scheduleRoute from './routes/schedule.js';
import interpolateRoute from './routes/interpolateRoute.js';



dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());

await connectMongo();
await initRedis();

app.use('/api', priceRoutes);
app.use('/api/schedule', scheduleRoute);
app.use('/api/interpolate', interpolateRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
