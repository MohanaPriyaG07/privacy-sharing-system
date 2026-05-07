import { useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');

const PRIVACY_LEVELS = [
  { id: 'low',    label: 'Low',    desc: 'Mask names & emails',        color: '#4CAF50' },
  { id: 'medium', label: 'Medium', desc: 'Pseudonymize + generalize',  color: '#FF9800' },
  { id: 'high',   label: 'High',   desc: 'Full encryption',            color: '#F44336' },
];

const STEPS = ['Upload', 'Detect PII', 'Choose Level', 'Anonymize', 'Share'];

const btnStyle = (bg) => ({
  padding: '10px 24px',
  background: bg,
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 15,
  userSelect: 'none',
  marginTop: 12
});

export default function UploadPage() {
  const [step, setStep]             = useState(1);
  const [file, setFile]             = useState(null);
  const [datasetId, setDatasetId]   = useState(null);
  const [analysis, setAnalysis]     = useState(null);
  const [privacyLevel, setPrivacyLevel] = useState(null);
  const [shareUrl, setShareUrl]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  // STEP 1 - Upload file
  const handleUpload = async () => {
    if (!file) { setError('Please select a file!'); return; }
    setLoading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await axios.post(`${API}/datasets/upload`, form, {
        headers: {
          Authorization: `Bearer ${token()}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setDatasetId(data.datasetId);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    }
    setLoading(false);
  };

  // STEP 2 - Detect PII
  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(
        `${API}/datasets/${datasetId}/analyze`, {},
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      setAnalysis(data);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed');
    }
    setLoading(false);
  };

  // STEP 3+4 - Apply privacy
  const handleProcess = async (level) => {
    setPrivacyLevel(level);
    setLoading(true);
    setError('');
    try {
      await axios.post(
        `${API}/datasets/${datasetId}/process`,
        { privacyLevel: level },
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      setStep(5);
    } catch (err) {
      setError(err.response?.data?.error || 'Processing failed');
    }
    setLoading(false);
  };

  // STEP 5 - Share
  const handleShare = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(
        `${API}/sharing/${datasetId}/share`,
        { expiryHours: 48 },
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      setShareUrl(data.shareUrl);
    } catch (err) {
      setError(err.response?.data?.error || 'Sharing failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '0 1rem' }}>
      <h2>Upload Dataset</h2>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {STEPS.map((s, i) => (
          <span key={i} style={{
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 13,
            userSelect: 'none',
            background: step > i + 1 ? '#4CAF50' : step === i + 1 ? '#2196F3' : '#e0e0e0',
            color: step >= i + 1 ? '#fff' : '#666'
          }}>{s}</span>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p style={{
          color: 'red',
          background: '#ffebee',
          padding: '10px 16px',
          borderRadius: 8,
          marginBottom: 16
        }}>
          ⚠️ {error}
        </p>
      )}

      {/* STEP 1 - Upload */}
      {step === 1 && (
        <div style={{
          border: '2px dashed #90caf9',
          borderRadius: 12,
          padding: '3rem',
          textAlign: 'center',
          background: '#fafafa'
        }}>
          <p style={{ fontSize: 18, marginBottom: 16 }}>
            Select your CSV file
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={e => setFile(e.target.files[0])}
            style={{ marginBottom: 16, cursor: 'pointer' }}
          />
          {file && (
            <p style={{ color: '#1976D2', marginBottom: 8 }}>
              📄 {file.name}
            </p>
          )}
          <br />
          <button
            onClick={handleUpload}
            disabled={loading}
            style={btnStyle('#1976D2')}
          >
            {loading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      )}

      {/* STEP 2 - Detect PII */}
      {step === 2 && (
        <div style={{
          background: '#e8f5e9',
          padding: 24,
          borderRadius: 12
        }}>
          <p style={{ color: 'green', fontWeight: 600, fontSize: 16 }}>
            ✅ File uploaded successfully!
          </p>
          <p>Click below to scan your file for sensitive data.</p>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={btnStyle('#388E3C')}
          >
            {loading ? 'Scanning...' : 'Detect Sensitive Data'}
          </button>
        </div>
      )}

      {/* STEP 3 - PII Results */}
      {step === 3 && analysis && (
        <div style={{
          background: '#fff3e0',
          padding: 24,
          borderRadius: 12
        }}>
          <h3>🔍 PII Detection Results</h3>
          <p>
            <strong>Risk Score: </strong>
            <span style={{
              color: analysis.riskScore > 60 ? 'red' :
                     analysis.riskScore > 30 ? 'orange' : 'green',
              fontWeight: 700,
              fontSize: 18
            }}>
              {analysis.riskScore}/100
            </span>
          </p>
          <p>
            <strong>Sensitive columns found: </strong>
            {analysis.piiFields.length > 0
              ? analysis.piiFields.join(', ')
              : 'None detected'}
          </p>
          <h3 style={{ marginTop: 24 }}>Choose Privacy Level</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            {PRIVACY_LEVELS.map(lvl => (
              <div
                key={lvl.id}
                onClick={() => !loading && handleProcess(lvl.id)}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 10,
                  cursor: 'pointer',
                  userSelect: 'none',
                  border: `2px solid ${lvl.color}`,
                  textAlign: 'center',
                  opacity: loading ? 0.6 : 1
                }}
              >
                <div style={{
                  fontWeight: 700,
                  color: lvl.color,
                  fontSize: 16,
                  pointerEvents: 'none'
                }}>
                  {lvl.label}
                </div>
                <div style={{
                  fontSize: 12,
                  color: '#666',
                  marginTop: 4,
                  pointerEvents: 'none'
                }}>
                  {lvl.desc}
                </div>
              </div>
            ))}
          </div>
          {loading && (
            <p style={{ color: '#1976D2', marginTop: 12 }}>
              ⏳ Anonymizing your dataset...
            </p>
          )}
        </div>
      )}

      {/* STEP 5 - Share */}
      {step === 5 && (
        <div style={{
          background: '#f3e5f5',
          padding: 24,
          borderRadius: 12
        }}>
          <h3>✅ Dataset Anonymized!</h3>
          <p>
            Privacy level applied: <strong>{privacyLevel}</strong>
          </p>
          <p>Your secure dataset is ready to share.</p>
          <button
            onClick={handleShare}
            disabled={loading || shareUrl}
            style={btnStyle('#7B1FA2')}
          >
            {loading ? 'Generating...' : 'Generate Share Link'}
          </button>

          {shareUrl && (
            <div style={{
              marginTop: 16,
              background: '#fff',
              padding: 16,
              borderRadius: 8,
              border: '1px solid #ce93d8'
            }}>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>
                🔗 Share URL (expires in 48h):
              </p>
              <code style={{
                wordBreak: 'break-all',
                fontSize: 13,
                color: '#7B1FA2'
              }}>
                {shareUrl}
              </code>
              <br />
              <button
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                style={{
                  marginTop: 8,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  borderRadius: 6,
                  border: '1px solid #ce93d8',
                  background: '#fff'
                }}
              >
                📋 Copy Link
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}