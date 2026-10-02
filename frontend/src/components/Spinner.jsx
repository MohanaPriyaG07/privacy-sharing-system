export default function Spinner({ size = 32, color = '#1976D2', text = '' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      padding: '2rem'
    }}>
      <div style={{
        width: size,
        height: size,
        border: `3px solid #e0e0e0`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
      {text && (
        <p style={{ color: '#666', fontSize: 14, margin: 0 }}>{text}</p>
      )}
    </div>
  );
}