import mongoose from 'mongoose';

const datasetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalName: String,
  storagePath: String,
  processedPath: String,
  columns: [String],
  piiFields: [String],
  riskScore: { type: Number, default: 0 },
  privacyLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['uploaded', 'analyzed', 'processed', 'shared'],
    default: 'uploaded'
  },
  rowCount: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Dataset', datasetSchema);