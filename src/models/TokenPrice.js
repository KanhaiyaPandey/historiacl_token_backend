import mongoose from 'mongoose';

const tokenPriceSchema = new mongoose.Schema({
  token: { type: String, required: true },
  network: { type: String, required: true },
  timestamp: { type: Number, required: true },
  price: { type: Number, required: true }
});

tokenPriceSchema.index({ token: 1, network: 1, timestamp: 1 }, { unique: true });

export const TokenPrice = mongoose.model('TokenPrice', tokenPriceSchema);
