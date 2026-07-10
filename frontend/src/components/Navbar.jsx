import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Utensils } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(() => JSON.parse(localStorage.getItem('userInfo')));

  useEffect(() => {
    const handleAuthChange = () => {
      setUserInfo(JSON.parse(localStorage.getItem('userInfo')));
    };
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  return (
    <nav className="navbar mb-6">
      <div className="container nav-container">
        <div className="flex items-center gap-2">
          <Utensils size={24} color="var(--primary)" />
          <span className="nav-brand">ReserveIt</span>
        </div>
        
        {userInfo && (
          <div className="nav-links">
            <span className="text-sm text-muted">
              <span className={`badge ${userInfo.role === 'admin' ? 'badge-admin' : 'badge-customer'} ml-2`}>{userInfo.role}</span>
            </span>
            <button className="btn btn-outline flex items-center gap-2" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
