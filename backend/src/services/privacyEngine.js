import crypto from 'crypto';

const ENCRYPTION_KEY = crypto.scryptSync('secret', 'salt', 32);

export function maskValue(value, fieldName) {
  if (!value) return value;
  const str = String(value);
  const f = fieldName.toLowerCase();

  if (f.includes('email')) {
    const [local, domain] = str.split('@');
    return local.slice(0, 2) + '***@' + domain;
  }
  if (f.includes('phone')) {  
    return str.replace(/\d(?=\d{4})/g, '*');
  }
  if (f.includes('name')) {
    return str[0] + '***';
  }
  return str.slice(0, 2) + '***';
}
 
export function pseudonymize(value) {
  return crypto
    .createHash('sha256')
    .update(String(value))
    .digest('hex')
    .slice(0, 12);
}

export function generalizeAge(age) {
  const n = parseInt(age);
  if (isNaN(n)) return 'Unknown';
  const bucket = Math.floor(n / 10) * 10;
  return `${bucket}-${bucket + 9}`;
}

export function generalizeZip(zip) {
  return String(zip).slice(0, 3) + '**';
}

export function encryptValue(value) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(String(value)),
    cipher.final()
  ]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function applyPrivacy(rows, headers, piiFields, level) {
  return rows.map(row => {
    const newRow = { ...row };

    for (const field of piiFields) {
      const val = newRow[field];
      if (val === undefined || val === null) continue;

      if (level === 'low') {
        newRow[field] = maskValue(val, field);
      } else if (level === 'medium') {
        if (/age|dob|birth/i.test(field)) {
          newRow[field] = generalizeAge(val);
        } else if (/zip|postal/i.test(field)) {
          newRow[field] = generalizeZip(val);
        } else {
          newRow[field] = pseudonymize(val);
        }
      } else if (level === 'high') {
        newRow[field] = encryptValue(val);
      }
    }

    return newRow;
  });
}