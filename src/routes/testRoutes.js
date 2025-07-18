// src/routes/testRoutes.js
import express from 'express';
import TokenPrice from '../models/TokenPrice.js';

const router = express.Router();

router.post('/test/insert-two-prices', async (req, res) => {
  try {
    const token = '0xTestTokenAddress';
    const network = 'polygon';
    const now = Math.floor(Date.now() / 1000); // current time in seconds

    const t1 = now - 3600;  // 1 hour ago
    const t3 = now + 3600;  // 1 hour ahead

    await TokenPrice.create([
      { token, network, timestamp: t1, price: 100 },
      { token, network, timestamp: t3, price: 200 }
    ]);

    res.json({ message: 'Inserted t1=100 and t3=200. Ready to interpolate t2.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to insert test prices' });
  }
});

export default router;
