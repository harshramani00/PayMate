const express = require('express');
const router = express.Router();
const ProcessedReceipt = require('../models/processedReceipt.model');
const { verifyToken } = require('../utils/verifyUser');

router.get('/processed-receipts/:id', verifyToken, async (req, res) => {
  try {
    const receipt = await ProcessedReceipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ message: 'Receipt not found' });
    res.json(receipt);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;