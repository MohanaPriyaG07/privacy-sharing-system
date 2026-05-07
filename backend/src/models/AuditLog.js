import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: String,
  datasetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dataset' },
  metadata: mongoose.Schema.Types.Mixed,
  ip: String,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('AuditLog', auditLogSchema);