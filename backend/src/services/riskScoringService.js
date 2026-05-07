export function calculateRiskScore(piiFields, totalColumns, rowCount) {
  const piiRatio = piiFields.length / Math.max(totalColumns, 1);
  const sizeRisk = Math.min(rowCount / 10000, 1);
  const score = Math.round((piiRatio * 60) + (sizeRisk * 40));
  return Math.min(score, 100);
}

export function getRiskLevel(score) {
  if (score < 30) return { level: 'low',    color: 'green' };
  if (score < 60) return { level: 'medium', color: 'orange' };
  return              { level: 'high',   color: 'red' };
}