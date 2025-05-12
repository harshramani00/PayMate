const express = require('express');
const router = express.Router();
const ProcessedReceipt = require('../models/processedReceipt.model');
const SplitAssignment = require('../models/splitAssignment.model');
const { verifyToken } = require('../utils/verifyUser');

// Helper to split amounts proportionally while preserving total
function proportionalSplit(total, amounts) {
  const totalBase = amounts.reduce((a, b) => a + b, 0);
  const raw = amounts.map(a => (total * a) / totalBase);

  let rounded = raw.map(val => parseFloat(val.toFixed(2)));
  let sumRounded = rounded.reduce((a, b) => a + b, 0);
  let diff = parseFloat((total - sumRounded).toFixed(2));

  if (Math.abs(diff) > 0) {
    const remainders = raw.map((val, i) => ({ i, rem: val - rounded[i] }));
    remainders.sort((a, b) => Math.abs(b.rem) - Math.abs(a.rem));
    rounded[remainders[0].i] = parseFloat((rounded[remainders[0].i] + diff).toFixed(2));
  }

  return rounded;
}

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

router.post('/save-splits/:receiptId', verifyToken, async (req, res) => {
  try {
    const { assignments, store, date } = req.body;
    const receipt = await ProcessedReceipt.findById(req.params.receiptId);

    if (!receipt) return res.status(404).json({ message: 'Receipt not found' });

    if (store) receipt.store = store;
    if (date) receipt.date = date;
    await receipt.save();

    const people = new Set();
    const splits = {};
    const itemSplits = [];

    // Validate + collect people
    receipt.items.forEach((item, index) => {
      const assigned = assignments[index];
      if (!assigned || assigned.length === 0) {
        throw new Error(`Item "${item.name}" is not assigned to anyone.`);
      }
      assigned.forEach(p => people.add(p));
    });

    people.forEach(p => {
      splits[p] = { itemsTotal: 0, tax: 0, tip: 0, discount: 0, total: 0 };
    });

    // Calculate item splits
    receipt.items.forEach((item, index) => {
      const assigned = assignments[index];
      const share = parseFloat((item.price / assigned.length).toFixed(2));
      let remaining = item.price;

      const splitEntry = {
        itemName: item.name,
        price: item.price,
        split: {}
      };

      assigned.forEach((person, i) => {
        const amount = i === assigned.length - 1 ? parseFloat(remaining.toFixed(2)) : share;
        splits[person].itemsTotal += amount;
        remaining -= amount;

        splitEntry.split[person] = amount;
      });

      itemSplits.push(splitEntry);
    });

    const peopleList = Array.from(people);
    const itemTotals = peopleList.map(p => splits[p].itemsTotal);

    // Apply tax, tip, discount using corrected split
    const taxShares = proportionalSplit(receipt.tax, itemTotals);
    const tipShares = proportionalSplit(receipt.tip, itemTotals);
    const discountShares = proportionalSplit(receipt.discount, itemTotals);

    peopleList.forEach((p, i) => {
      splits[p].tax = taxShares[i];
      splits[p].tip = tipShares[i];
      splits[p].discount = discountShares[i];
      splits[p].total = parseFloat(
        (splits[p].itemsTotal + splits[p].tax + splits[p].tip + splits[p].discount).toFixed(2)
      );
    });

    const saved = await SplitAssignment.create({
      userId: req.user.id,
      receiptId: receipt._id,
      splits,
      itemSplits,
    });

    res.status(201).json({ message: 'Split saved', splitId: saved._id });

  } catch (err) {
    console.error('Split save error:', err);
    res.status(400).json({ message: err.message || 'Error saving split' });
  }
});

module.exports = router;