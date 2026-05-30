import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { LayoutDashboard, Users, Map, Settings } from 'lucide-react';

export default function AdminDriverLayout() {
  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin-driver' },
    { icon: Users, label: 'Manajemen Driver', path: '/admin-driver/list' },
    { icon: Map, label: 'Aktivitas', path: '/admin-driver/activity' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)' }}>
      <Sidebar navItems={navItems} accentColor="#f59e0b" roleName="Admin Driver" />
      <div style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>
        <header className="page-header" style={{ 
          backgroundColor: '#fff', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#f59e0b', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
              AD
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>Portal Admin Driver</h1>
            </div>
          </div>
        </header>

        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
