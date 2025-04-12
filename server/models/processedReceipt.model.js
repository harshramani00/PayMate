const mongoose = require('mongoose');

const processedReceiptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  store: String,
  date: String,
  items: [
    {
      name: String,
      price: Number,
    },
  ],
  tax: Number,
  tip: Number,
  discount: Number,
  total: Number,
  currency: {
    type: String,
    default: '$',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ProcessedReceipt', processedReceiptSchema);
