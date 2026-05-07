import mongoose from 'mongoose';

const sharedLinkSchema = new mongoose.Schema({
  datasetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dataset' },
  token: { type: String, unique: true },
  sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expiresAt: Date,
  accessCount: { type: Number, default: 0 },
  isRevoked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('SharedLink', sharedLinkSchema);