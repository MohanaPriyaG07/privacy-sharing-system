import express from 'express';
import multer from 'multer';
import fs from 'fs';
import Papa from 'papaparse';
import { detectPIIColumns } from '../services/detectionService.js';
import { applyPrivacy } from '../services/privacyEngine.js';
import { calculateRiskScore } from '../services/riskScoringService.js';
import Dataset from '../models/Dataset.js';
import AuditLog from '../models/AuditLog.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ dest: './uploads' });

// STEP 1 - Upload dataset
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    const parsed = Papa.parse(fileContent, { header: true });
    const headers = parsed.meta.fields;
    const rows = parsed.data.filter(r => Object.keys(r).length > 1);

    const dataset = await Dataset.create({
      userId: req.user._id,
      originalName: req.file.originalname,
      storagePath: req.file.path,
      columns: headers,
      rowCount: rows.length,
      status: 'uploaded'
    });

    await AuditLog.create({
      userId: req.user._id,
      action: 'upload',
      datasetId: dataset._id,
      metadata: { filename: req.file.originalname, rows: rows.length }
    });

    res.json({
      success: true,
      datasetId: dataset._id,
      columns: headers,
      rowCount: rows.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// STEP 2 - Detect PII
router.post('/:id/analyze', protect, async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id);
    const fileContent = fs.readFileSync(dataset.storagePath, 'utf8');
    const parsed = Papa.parse(fileContent, { header: true });
    const rows = parsed.data;

    const detection = detectPIIColumns(dataset.columns, rows);
    const piiFields = Object.entries(detection)
      .filter(([, v]) => v.isPII)
      .map(([k]) => k);

    const riskScore = calculateRiskScore(
      piiFields,
      dataset.columns.length,
      dataset.rowCount
    );

    dataset.piiFields = piiFields;
    dataset.riskScore = riskScore;
    dataset.status = 'analyzed';
    await dataset.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'analyze',
      datasetId: dataset._id,
      metadata: { piiFields, riskScore }
    });

    res.json({ piiFields, riskScore, detection });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/:id/process', protect, async (req, res) => {
  try {
    const { privacyLevel } = req.body;
    const dataset = await Dataset.findById(req.params.id);

    const fileContent = fs.readFileSync(dataset.storagePath, 'utf8');
    const parsed = Papa.parse(fileContent, { header: true });
    const rows = parsed.data;

    const processedRows = applyPrivacy(
      rows,
      dataset.columns,
      dataset.piiFields,
      privacyLevel
    );

    const processedPath = dataset.storagePath + '_processed.csv';
    const processedCSV = Papa.unparse(processedRows);
    fs.writeFileSync(processedPath, processedCSV);

    dataset.processedPath = processedPath;
    dataset.privacyLevel = privacyLevel;
    dataset.status = 'processed';
    await dataset.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'anonymize',
      datasetId: dataset._id,
      metadata: { privacyLevel, rowsProcessed: processedRows.length }
    });

    res.json({
      success: true,
      message: `Dataset processed at '${privacyLevel}' privacy level`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all datasets for user
router.get('/', protect, async (req, res) => {
  try {
    const datasets = await Dataset.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(datasets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;