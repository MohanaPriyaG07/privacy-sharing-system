import { useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const url = isRegister
        ? `${API}/auth/register`
        : `${API}/auth/login`;

      const body = isRegister
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password };

      const { data } = await axios.post(url, body);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div style={{
      maxWidth: 400,
      margin: '4rem auto',
      padding: '2rem',
      border: '1px solid #e0e0e0',
      borderRadius: 12,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>
        🔒 {isRegister ? 'Create Account' : 'Login'}
      </h2>

      {isRegister && (
        <input
          placeholder="Full Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          style={inputStyle}
        />
      )}

      <input
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
        style={inputStyle}
      />

      <input
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })}
        style={inputStyle}
      />

      {error && (
        <p style={{ color: 'red', fontSize: 13, marginBottom: 12 }}>
          ⚠️ {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          background: '#1976D2',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 15,
          marginBottom: 12
        }}
      >
        {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
      </button>

      <p style={{ textAlign: 'center', fontSize: 13, color: '#666' }}>
        {isRegister ? 'Already have an account?' : "Don't have an account?"}
        <span
          onClick={() => setIsRegister(!isRegister)}
          style={{ color: '#1976D2', cursor: 'pointer', marginLeft: 6 }}
        >
          {isRegister ? 'Login' : 'Register'}
        </span>
      </p>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  marginBottom: 12,
  border: '1px solid #e0e0e0',
  borderRadius: 8,
  fontSize: 14,
  boxSizing: 'border-box'
};