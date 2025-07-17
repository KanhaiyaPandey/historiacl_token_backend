import express from 'express';
import { getInterpolatedPrice } from '../services/interpolatePrice.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { token, network, timestamp } = req.query;

  if (!token || !network || !timestamp) {
    return res.status(400).json({ message: 'Missing token, network or timestamp' });
  }

  try {
    const parsedTimestamp = parseInt(timestamp, 10);
    const price = await getInterpolatedPrice(token, network, parsedTimestamp);
    return res.status(200).json({ price });
  } catch (err) {
    console.error('❌ GET /interpolate failed:', err.message);
    return res.status(500).json({ message: err.message });
  }
});

export default router;
