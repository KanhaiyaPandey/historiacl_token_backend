import mongoose from 'mongoose';

const priceSchema = new mongoose.Schema({
  token: { type: String, required: true },
  network: { type: String, required: true },
  timestamp: { type: Number, required: true },
  price: { type: Number, required: true },
});

priceSchema.index({ token: 1, network: 1, timestamp: 1 }, { unique: true });

export default mongoose.model('Price', priceSchema);
