import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import priceRoutes from './routes/priceRoutes.js';
import testRoutes from './routes/testRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: '*', // ⚠️ Replace with actual domain in production
  credentials: true,
}));
app.use(express.json());

app.use('/api', priceRoutes);
app.use('/api', testRoutes);

export default app;
