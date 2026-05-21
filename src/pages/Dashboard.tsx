import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Leaf } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const getRoleColor = () => {
    switch (user?.role) {
      case 'rumah_tangga': return 'var(--role-rumah-tangga)';
      case 'driver': return 'var(--role-driver)';
      case 'admin_tps3r': return 'var(--role-admin)';
      case 'mitra_b2b': return 'var(--role-mitra)';
      case 'pemda': return 'var(--role-pemda)';
      default: return 'var(--color-primary)';
    }
  };

  return (
    <div className="layout-container">
      {/* Sidebar matching the design aesthetic */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo" style={{ backgroundColor: getRoleColor() }}>
            <div className="brand-logo-inner"></div>
          </div>
          <span className="brand-text">e-TrashHub</span>
        </div>
        
        <nav className="sidebar-nav">
          <div className="sidebar-active-item">
            <div className="active-dot"></div>
            <span>{user?.role.replace('_', ' ').toUpperCase()} Dashboard</span>
          </div>
          {/* Preserved content limits, no extra items added */}
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="top-header">
          <div className="header-title">
            <h2>Welcome to Dashboard</h2>
          </div>
          <div className="header-actions">
            <button className="btn-logout" onClick={logout}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="main-content">
          <div className="card">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-secondary)' }}>Welcome, {user?.name}!</h2>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              This is the initial scaffold for your dashboard. 
              When you request "generate Phase X", the specific functionalities for your role ({user?.role}) will be built out here.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
