import mongoose from 'mongoose';

const TokenPriceSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    lowercase: true,
  },
  network: {
    type: String,
    required: true,
    enum: ['ethereum', 'polygon'],
    lowercase: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true, // for createdAt and updatedAt fields
});

// Create an index to speed up queries by token, network, and timestamp
TokenPriceSchema.index({ token: 1, network: 1, timestamp: 1 }, { unique: true });

const TokenPrice = mongoose.model('TokenPrice', TokenPriceSchema);

export default TokenPrice;
