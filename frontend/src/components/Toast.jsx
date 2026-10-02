import { useState, useEffect } from 'react';

export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: { bg: '#e8f5e9', border: '#4CAF50', text: '#2e7d32', icon: '✅' },
    error:   { bg: '#ffebee', border: '#f44336', text: '#c62828', icon: '❌' },
    info:    { bg: '#e3f2fd', border: '#2196F3', text: '#1565c0', icon: 'ℹ️' },
    warning: { bg: '#fff3e0', border: '#FF9800', text: '#e65100', icon: '⚠️' },
  };

  const c = colors[type];

  return (
    <div style={{
      position: 'fixed',
      top: 24,
      right: 24,
      zIndex: 9999,
      background: c.bg,
      border: `1.5px solid ${c.border}`,
      borderRadius: 10,
      padding: '14px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
      minWidth: 260,
      maxWidth: 380,
      animation: 'slideIn 0.25s ease'
    }}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <span style={{ fontSize: 18 }}>{c.icon}</span>
      <span style={{ color: c.text, fontSize: 14, flex: 1 }}>{message}</span>
      <span
        onClick={onClose}
        style={{ color: c.text, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
      >×</span>
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const ToastContainer = () => (
    <div style={{
      position: 'fixed',
      top: 24,
      right: 24,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }}>
      {toasts.map((t, i) => (
        <div key={t.id} style={{
          background: {
            success: '#e8f5e9', error: '#ffebee',
            info: '#e3f2fd', warning: '#fff3e0'
          }[t.type],
          border: `1.5px solid ${{
            success: '#4CAF50', error: '#f44336',
            info: '#2196F3', warning: '#FF9800'
          }[t.type]}`,
          borderRadius: 10,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
          minWidth: 260,
          maxWidth: 380,
          animation: 'slideIn 0.25s ease'
        }}>
          <style>{`
            @keyframes slideIn {
              from { opacity: 0; transform: translateX(60px); }
              to   { opacity: 1; transform: translateX(0); }
            }
          `}</style>
          <span style={{ fontSize: 18 }}>
            {{ success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }[t.type]}
          </span>
          <span style={{
            color: {
              success: '#2e7d32', error: '#c62828',
              info: '#1565c0', warning: '#e65100'
            }[t.type],
            fontSize: 14,
            flex: 1
          }}>
            {t.message}
          </span>
          <span
            onClick={() => removeToast(t.id)}
            style={{ cursor: 'pointer', fontSize: 18, lineHeight: 1, opacity: 0.6 }}
          >×</span>
        </div>
      ))}
    </div>
  );

  return { showToast, ToastContainer };
}