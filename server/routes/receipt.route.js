const express = require('express')
const { verifyToken } = require('../utils/verifyUser.js');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path')
const upload = require('../utils/upload.js');
const Receipt = require('../models/receipt.model.js');
const ProcessedReceipt = require('../models/processedReceipt.model.js');

const router = express.Router();

router.post('/scan-receipt', verifyToken, upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const receipt = await Receipt.create({
      userId: req.user.id,
      filename: req.file.filename,
      filePath: req.file.path,
    });

    const imagePath = path.resolve(req.file.path);

    // Spawn Python process
    const python = spawn('python', ['../ocr_model/text_extraction.py', imagePath]); // adjust path as needed

    let output = '';
    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      console.error('Python stderr:', data.toString());
    });

    python.on('close', async (code) => {
      fs.unlink(imagePath, () => {}); // cleanup uploaded file

      try {
        const parsed = JSON.parse(output);

        if (parsed.error) {
          return res.status(400).json({ message: parsed.error });
        }

        const processed = await ProcessedReceipt.create({
          userId: req.user.id,
          store: parsed.store,
          date: parsed.date,
          items: parsed.items,
          tax: parsed.tax,
          discount: parsed.discount,
          total: parsed.total,
          currency: parsed.currency,
        });

        res.status(200).json(processed);
      } catch (err) {
        console.error('Failed to parse Python output:', err);
        res.status(500).json({ message: 'Failed to process receipt' });
      }
    });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

module.exports = router;