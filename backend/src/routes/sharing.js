import express from 'express';
import { createShareLink, validateAndAccessLink } from '../services/sharingService.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Generate share link
router.post('/:datasetId/share', protect, async (req, res) => {
  try {
    const { expiryHours = 24 } = req.body;
    const link = await createShareLink(
      req.params.datasetId,
      req.user._id,
      expiryHours
    );
    res.json({ shareUrl: link, expiresIn: `${expiryHours} hours` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Access shared dataset
router.get('/access/:token', async (req, res) => {
  try {
    const dataset = await validateAndAccessLink(req.params.token);
    const filePath = dataset.processedPath || dataset.storagePath;
    res.download(filePath, dataset.originalName + '_private.csv');
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
});

export default router;