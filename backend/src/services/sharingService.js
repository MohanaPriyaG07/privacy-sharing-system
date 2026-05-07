import { v4 as uuidv4 } from 'uuid';
import SharedLink from '../models/SharedLink.js';
import AuditLog from '../models/AuditLog.js';

export async function createShareLink(datasetId, userId, expiryHours = 24) {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + expiryHours * 3600 * 1000);

  await SharedLink.create({
    datasetId,
    token,
    sharedBy: userId,
    expiresAt
  });

  await AuditLog.create({
    userId,
    action: 'share',
    datasetId,
    metadata: { token, expiresAt }
  });

  return `${process.env.SHARE_BASE_URL}/api/sharing/access/${token}`;
}

export async function validateAndAccessLink(token) {
  const link = await SharedLink.findOne({ token }).populate('datasetId');

  if (!link) throw new Error('Invalid link');
  if (link.isRevoked) throw new Error('Link has been revoked');
  if (link.expiresAt < new Date()) throw new Error('Link has expired');

  link.accessCount += 1;
  await link.save();

  await AuditLog.create({
    action: 'access',
    datasetId: link.datasetId._id,
    metadata: { token, accessCount: link.accessCount }
  });

  return link.datasetId;
}