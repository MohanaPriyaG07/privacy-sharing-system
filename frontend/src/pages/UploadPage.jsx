import { useState } from 'react';
import axios from 'axios';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';

const API = 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');

const PRIVACY_LEVELS = [
  { id: 'low',    label: 'Low',    desc: 'Mask names & emails',       color: '#4CAF50' },
  { id: 'medium', label: 'Medium', desc: 'Pseudonymize + generalize',  color: '#FF9800' },
  { id: 'high',   label: 'High',   desc: 'Full encryption',            color: '#F44336' },
];

const STEPS = ['Upload', 'Detect PII', 'Choose Level', 'Anonymize', 'Share'];

const btnStyle = (bg, disabled = false) => ({
  padding: '10px 24px',
  background: disabled ? '#ccc' : bg,
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: 15,
  userSelect: 'none',
  marginTop: 12
});

export default function UploadPage() {
  const [step, setStep]               = useState(1);
  const [file, setFile]               = useState(null);
  const [datasetId, setDatasetId]     = useState(null);
  const [analysis, setAnalysis]       = useState(null);
  const [privacyLevel, setPrivacyLevel] = useState(null);
  const [shareUrl, setShareUrl]       = useState('');
  const [loading, setLoading]         = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const { showToast, ToastContainer } = useToast();

  const handleUpload = async () => {
    if (!file) { showToast('Please select a file first!', 'warning'); return; }
    setLoading(true);
    setLoadingText('Uploading your file...');
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
      showToast(`File uploaded! ${data.rowCount} rows detected.`, 'success');
      setStep(2);
    } catch (err) {
      showToast(err.response?.data?.error || 'Upload failed', 'error');
    }
    setLoading(false);
    setLoadingText('');
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setLoadingText('Scanning for sensitive data...');
    try {
      const { data } = await axios.post(
        `${API}/datasets/${datasetId}/analyze`, {},
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      setAnalysis(data);
      showToast(
        `Found ${data.piiFields.length} sensitive fields. Risk score: ${data.riskScore}/100`,
        data.riskScore > 60 ? 'warning' : 'info'
      );
      setStep(3);
    } catch (err) {
      showToast(err.response?.data?.error || 'Analysis failed', 'error');
    }
    setLoading(false);
    setLoadingText('');
  };

  const handleProcess = async (level) => {
    setPrivacyLevel(level);
    setLoading(true);
    setLoadingText(`Applying ${level} privacy protection...`);
    try {
      await axios.post(
        `${API}/datasets/${datasetId}/process`,
        { privacyLevel: level },
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      showToast('Dataset anonymized successfully!', 'success');
      setStep(5);
    } catch (err) {
      showToast(err.response?.data?.error || 'Processing failed', 'error');
    }
    setLoading(false);
    setLoadingText('');
  };

  const handleShare = async () => {
    setLoading(true);
    setLoadingText('Generating secure link...');
    try {
      const { data } = await axios.post(
        `${API}/sharing/${datasetId}/share`,
        { expiryHours: 48 },
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      setShareUrl(data.shareUrl);
      showToast('Secure share link generated!', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Sharing failed', 'error');
    }
    setLoading(false);
    setLoadingText('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    showToast('Link copied to clipboard!', 'info');
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '0 1rem' }}>
      <ToastContainer />
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

      {/* Loading spinner overlay */}
      {loading && (
        <div style={{
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: 12,
          marginBottom: 16
        }}>
          <Spinner size={40} text={loadingText} />
        </div>
      )}

      {/* Step 1 - Upload */}
      {step === 1 && !loading && (
        <div style={{
          border: '2px dashed #90caf9',
          borderRadius: 12,
          padding: '3rem',
          textAlign: 'center',
          background: '#fafafa'
        }}>
          <p style={{ fontSize: 18, marginBottom: 16 }}>Select your CSV file</p>
          <input
            type="file"
            accept=".csv"
            onChange={e => setFile(e.target.files[0])}
            style={{ marginBottom: 16, cursor: 'pointer' }}
          />
          {file && (
            <p style={{ color: '#1976D2', marginBottom: 8 }}>📄 {file.name}</p>
          )}
          <br />
          <button onClick={handleUpload} style={btnStyle('#1976D2')}>
            Upload File
          </button>
        </div>
      )}

      {/* Step 2 - Detect PII */}
      {step === 2 && !loading && (
        <div style={{ background: '#e8f5e9', padding: 24, borderRadius: 12 }}>
          <p style={{ color: 'green', fontWeight: 600, fontSize: 16 }}>
            ✅ File uploaded successfully!
          </p>
          <p>Click below to scan your file for sensitive data.</p>
          <button onClick={handleAnalyze} style={btnStyle('#388E3C')}>
            Detect Sensitive Data
          </button>
        </div>
      )}

      {/* Step 3 - PII Results + Privacy Level */}
      {step === 3 && analysis && !loading && (
        <div style={{ background: '#fff3e0', padding: 24, borderRadius: 12 }}>
          <h3>🔍 Detection Results</h3>

          {/* Risk score bar */}
          <p style={{ marginBottom: 4 }}>
            <strong>Risk Score: </strong>
            <span style={{
              color: analysis.riskScore > 60 ? '#f44336' :
                     analysis.riskScore > 30 ? '#FF9800' : '#4CAF50',
              fontWeight: 700,
              fontSize: 18
            }}>
              {analysis.riskScore}/100
            </span>
          </p>
          <div style={{
            height: 10,
            background: '#e0e0e0',
            borderRadius: 10,
            marginBottom: 16,
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${analysis.riskScore}%`,
              background: analysis.riskScore > 60 ? '#f44336' :
                          analysis.riskScore > 30 ? '#FF9800' : '#4CAF50',
              borderRadius: 10,
              transition: 'width 0.6s ease'
            }} />
          </div>

          <p>
            <strong>Sensitive columns: </strong>
            {analysis.piiFields.length > 0
              ? analysis.piiFields.map(f => (
                  <span key={f} style={{
                    display: 'inline-block',
                    background: '#ffccbc',
                    color: '#bf360c',
                    borderRadius: 12,
                    padding: '2px 10px',
                    fontSize: 12,
                    marginRight: 6,
                    marginBottom: 4
                  }}>{f}</span>
                ))
              : 'None detected'}
          </p>

          <h3 style={{ marginTop: 20 }}>Choose Privacy Level</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            {PRIVACY_LEVELS.map(lvl => (
              <div
                key={lvl.id}
                onClick={() => handleProcess(lvl.id)}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 10,
                  cursor: 'pointer',
                  userSelect: 'none',
                  border: `2px solid ${lvl.color}`,
                  textAlign: 'center',
                  background: '#fff',
                  transition: 'transform 0.15s, box-shadow 0.15s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 6px 16px ${lvl.color}33`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  fontWeight: 700, color: lvl.color,
                  fontSize: 16, pointerEvents: 'none'
                }}>
                  {lvl.label}
                </div>
                <div style={{
                  fontSize: 12, color: '#666',
                  marginTop: 4, pointerEvents: 'none'
                }}>
                  {lvl.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 5 - Share */}
      {step === 5 && !loading && (
        <div style={{ background: '#f3e5f5', padding: 24, borderRadius: 12 }}>
          <h3>✅ Dataset Anonymized!</h3>
          <p>Privacy level: <strong>{privacyLevel}</strong></p>

          <button
            onClick={handleShare}
            disabled={!!shareUrl}
            style={btnStyle('#7B1FA2', !!shareUrl)}
          >
            Generate Share Link
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
                onClick={handleCopy}
                style={{
                  marginTop: 10,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  borderRadius: 8,
                  border: '1.5px solid #ce93d8',
                  background: '#f3e5f5',
                  color: '#7B1FA2',
                  fontWeight: 600
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