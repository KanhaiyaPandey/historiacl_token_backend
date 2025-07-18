import express from 'express';
import { getTokenPrice, schedulePriceHistory, scheduleFullHistory } from '../controllers/priceController.js';

const router = express.Router();

// POST /price → Fetch historical price (exact or interpolated)
router.post('/price', (req, res, next) => {
  console.log('✅ /api/price hit');
  next();
}, getTokenPrice);

// POST /schedule → Schedule full price history fetch
router.post('/schedule', schedulePriceHistory);
router.post('/schedule-full-history', scheduleFullHistory);

export default router;
