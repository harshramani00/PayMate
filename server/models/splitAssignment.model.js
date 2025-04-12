const mongoose = require('mongoose');

const splitAssignmentSchema = new mongoose.Schema({
  receiptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProcessedReceipt',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  splits: {
    type: Map,
    of: new mongoose.Schema({
      itemsTotal: Number,
      tax: Number,
      tip: Number,
      discount: Number,
      total: Number,
    }, { _id: false }),
    required: true
  },
  itemSplits: [
    {
      itemName: { type: String, required: true },
      price: { type: Number, required: true },
      split: {
        type: Map,
        of: Number,
        required: true
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});


module.exports = mongoose.model('SplitAssignment', splitAssignmentSchema);
