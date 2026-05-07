import { Link } from 'react-router-dom';

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <nav style={{
      background: '#1976D2',
      padding: '12px 24px',
      display: 'flex',
      gap: 24,
      alignItems: 'center'
    }}>
      <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>
        🔒 PrivacyShare
      </span>
      <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</Link>
      <Link to="/upload" style={{ color: '#fff', textDecoration: 'none' }}>Upload</Link>
      <div style={{ marginLeft: 'auto' }}>
        {user ? (
          <span style={{ color: '#fff', fontSize: 14 }}>
            👤 {user.name} &nbsp;
            <span
              onClick={logout}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              Logout
            </span>
          </span>
        ) : (
          <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}