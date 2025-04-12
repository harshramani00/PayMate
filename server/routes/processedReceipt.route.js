const express = require('express');
const router = express.Router();
const ProcessedReceipt = require('../models/processedReceipt.model');
const SplitAssignment = require('../models/splitAssignment.model');
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

router.post('/save-splits/:receiptId', verifyToken, async (req, res) => {
  try {
    const { assignments, store, date } = req.body;
    const receipt = await ProcessedReceipt.findById(req.params.receiptId);

    if (!receipt) return res.status(404).json({ message: 'Receipt not found' });

    // Allow manual override for store and date
    if (store) receipt.store = store;
    if (date) receipt.date = date;
    await receipt.save();

    const people = new Set();
    const splits = {};
    const itemSplits = [];

    // Validate + initialize
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

    // Split item costs & track itemSplits
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

    // Total item sum for proportional distribution
    const totalItems = Object.values(splits).reduce((acc, p) => acc + p.itemsTotal, 0);

    // Apply tax proportionally
    for (const person in splits) {
      const proportion = splits[person].itemsTotal / totalItems;
      splits[person].tax = parseFloat((receipt.tax * proportion).toFixed(2));
    }

    // Apply tip proportionally
    for (const person in splits) {
      const proportion = splits[person].itemsTotal / totalItems;
      splits[person].tip = parseFloat((receipt.tip * proportion).toFixed(2));
    }

    // Apply discount proportionally
    for (const person in splits) {
      const proportion = splits[person].itemsTotal / totalItems;
      splits[person].discount = parseFloat((receipt.discount * proportion).toFixed(2));
    }

    // Final total per person
    for (const person in splits) {
      const s = splits[person];
      s.total = parseFloat((s.itemsTotal + s.tax + s.tip + s.discount).toFixed(2));
    }

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