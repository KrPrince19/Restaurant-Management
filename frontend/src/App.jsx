import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';

function App() {
  const [userInfo, setUserInfo] = useState(() => JSON.parse(localStorage.getItem('userInfo')));

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
