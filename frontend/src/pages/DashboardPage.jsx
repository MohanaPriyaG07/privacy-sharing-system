import { useState, useEffect } from 'react';
import axios from 'axios';
import Spinner from '../components/Spinner';
import { useToast } from '../components/Toast';

const API = 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');

export default function DashboardPage() {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading]   = useState(true);
  const { showToast, ToastContainer } = useToast();

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const { data } = await axios.get(`${API}/datasets`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      setDatasets(data);
    } catch (err) {
      showToast('Failed to load datasets', 'error');
    }
    setLoading(false);
  };

  const getRiskColor = (score) => {
    if (score > 60) return '#F44336';
    if (score > 30) return '#FF9800';
    return '#4CAF50';
  };

  const getStatusColor = (status) => {
    if (status === 'shared')    return '#7B1FA2';
    if (status === 'processed') return '#388E3C';
    if (status === 'analyzed')  return '#1976D2';
    return '#666';
  };

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
      <ToastContainer />

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
      }}>
        <div>
          <h2 style={{ margin: 0 }}>Dashboard</h2>
          <p style={{ color: '#666', margin: 0 }}>
            Welcome back, {user.name}!
          </p>
        </div>
        <a href="/upload" style={{
          padding: '10px 20px',
          background: '#1976D2',
          color: '#fff',
          borderRadius: 8,
          textDecoration: 'none',
          fontWeight: 600
        }}>
          + Upload Dataset
        </a>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        marginBottom: 32
      }}>
        {[
          {
            label: 'Total Datasets',
            value: datasets.length,
            color: '#1976D2'
          },
          {
            label: 'Processed',
            value: datasets.filter(d =>
              d.status === 'processed' || d.status === 'shared'
            ).length,
            color: '#388E3C'
          },
          {
            label: 'Shared',
            value: datasets.filter(d => d.status === 'shared').length,
            color: '#7B1FA2'
          },
        ].map((stat, i) => (
          <div key={i} style={{
            background: '#f5f5f5',
            padding: 20,
            borderRadius: 12,
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: 32,
              fontWeight: 700,
              color: stat.color
            }}>
              {stat.value}
            </div>
            <div style={{ color: '#666', fontSize: 14 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Dataset list */}
      <h3>Your Datasets</h3>

      {loading && <Spinner size={36} text="Loading your datasets..." />}

      {!loading && datasets.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: '#fafafa',
          borderRadius: 12,
          border: '2px dashed #e0e0e0'
        }}>
          <p style={{ fontSize: 18, color: '#666' }}>
            No datasets yet!
          </p>
          <a href="/upload" style={{
            color: '#1976D2',
            fontWeight: 600
          }}>
            Upload your first dataset →
          </a>
        </div>
      )}

      {!loading && datasets.map(dataset => (
        <div key={dataset._id} style={{
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <p style={{
              fontWeight: 600,
              fontSize: 16,
              margin: '0 0 6px'
            }}>
              📄 {dataset.originalName}
            </p>
            <p style={{ color: '#666', fontSize: 13, margin: '0 0 6px' }}>
              {dataset.rowCount} rows · {dataset.columns?.length} columns
            </p>
            <p style={{ fontSize: 13, margin: 0 }}>
              PII Fields: <strong>
                {dataset.piiFields?.length > 0
                  ? dataset.piiFields.join(', ')
                  : 'Not analyzed yet'}
              </strong>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            {/* Risk score */}
            <div style={{
              fontWeight: 700,
              color: getRiskColor(dataset.riskScore),
              fontSize: 18,
              marginBottom: 6
            }}>
              Risk: {dataset.riskScore}/100
            </div>

            {/* Status badge */}
            <span style={{
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 12,
              background: getStatusColor(dataset.status) + '22',
              color: getStatusColor(dataset.status),
              fontWeight: 600
            }}>
              {dataset.status}
            </span>

            {/* Privacy level */}
            {dataset.privacyLevel && (
              <p style={{
                fontSize: 12,
                color: '#666',
                margin: '6px 0 0'
              }}>
                Privacy: {dataset.privacyLevel}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}