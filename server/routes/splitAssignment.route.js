const express = require('express');
const router = express.Router();
const SplitAssignment = require('../models/splitAssignment.model');
const { verifyToken } = require('../utils/verifyUser');

router.get('/:splitId', verifyToken, async (req, res) => {
  try {
    const split = await SplitAssignment.findById(req.params.splitId).populate('receiptId');
    if (!split) return res.status(404).json({ message: 'Split not found' });

    // Transform itemSplits into frontend-friendly format
    const itemizedSplits = split.itemSplits.map(item => ({
      itemName: item.itemName,
      shares: Array.from(item.split.entries()).map(([person, amount]) => ({
        person,
        amount,
      }))
    }));

    res.json({
      splits: Object.fromEntries(split.splits),
      receipt: {
        store: split.receiptId.store,
        date: split.receiptId.date,
      },
      itemizedSplits,
    });
  } catch (err) {
    console.error('Fetch split error:', err);
    res.status(500).json({ message: 'Failed to fetch split' });
  }
});

// Get all splits for the currently logged-in user
router.get('/user/me', verifyToken, async (req, res) => {
  try {
    const splits = await SplitAssignment.find({ userId: req.user.id }).populate('receiptId');
    res.status(200).json(splits);
  } catch (err) {
    console.error('Error fetching user split history:', err);
    res.status(500).json({ message: 'Failed to fetch split history' });
  }
});



module.exports = router;
