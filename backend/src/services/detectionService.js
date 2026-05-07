const PII_PATTERNS = {
  email:      { regex: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}\b/i },
  phone:      { regex: /\b(\+?\d[\d\s\-().]{7,14}\d)\b/ },
  ssn:        { regex: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/ },
  creditCard: { regex: /\b(?:\d[ -]?){13,16}\b/ },
  dob:        { regex: /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/ },
  ipAddress:  { regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/ },
};

const PII_KEYWORDS = [
  'name', 'email', 'phone', 'address', 'ssn', 'social',
  'dob', 'birth', 'passport', 'license', 'salary', 'income',
  'account', 'card', 'ip', 'gender', 'race', 'medical'
];

export function detectPIIColumns(headers, sampleRows) {
  const detected = {};

  for (const header of headers) {
    const lower = header.toLowerCase();
    const nameMatch = PII_KEYWORDS.some(k => lower.includes(k));

    const patternMatches = [];
    for (const row of sampleRows.slice(0, 20)) {
      const value = String(row[header] || '');
      for (const [type, { regex }] of Object.entries(PII_PATTERNS)) {
        if (regex.test(value)) patternMatches.push(type);
      }
    }

    detected[header] = {
      isPII: nameMatch || patternMatches.length > 2,
      confidence: nameMatch ? 0.8 : Math.min(patternMatches.length / 5, 1.0),
      detectedTypes: [...new Set(patternMatches)]
    };
  }

  return detected;
}