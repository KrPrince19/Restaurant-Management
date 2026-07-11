import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';

function App() {
  const [userInfo, setUserInfo] = useState(() => JSON.parse(localStorage.getItem('userInfo')));
  const [showPopup, setShowPopup] = useState(true);

  useEffect(() => {
    const handleAuthChange = () => {
      setUserInfo(JSON.parse(localStorage.getItem('userInfo')));
    };
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  return (
    <Router>
      <Navbar />
      
      {/* Notice Popup */}
      {showPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div className="card animate-fade-in" style={{ maxWidth: '400px', textAlign: 'center', margin: '20px' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Notice</h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Welcome! The backend API is hosted on Render's free tier. 
              It may take <strong>up to 60 seconds</strong> to wake up from inactivity on your first request. 
              Thank you for your patience!
            </p>
            <button className="btn btn-primary w-100" onClick={() => setShowPopup(false)}>
              OK, I Understand
            </button>
          </div>
        </div>
      )}

      <div className="container">
        <Routes>
          <Route path="/" element={
            userInfo ? (
              userInfo.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />
            ) : <Navigate to="/login" />
          } />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/dashboard" element={
            userInfo ? (
              userInfo.role === 'customer' ? <CustomerDashboard /> : <Navigate to="/admin" />
            ) : <Navigate to="/login" />
          } />
          <Route path="/admin" element={
            userInfo ? (
              userInfo.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />
            ) : <Navigate to="/login" />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
