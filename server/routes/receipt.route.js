const express = require('express')
const { verifyToken } = require('../utils/verifyUser.js');
const upload = require('../utils/upload.js');
const Receipt = require('../models/receipt.model.js')

const router = express.Router();

router.post('/scan-receipt', verifyToken, upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const receipt = new Receipt({
      userId: req.user.id,
      filename: req.file.filename,
      filePath: req.file.path,
    });

    await receipt.save();

    res.status(201).json({
      message: 'Receipt uploaded successfully',
      receiptId: receipt._id,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

module.exports = router;