import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { LayoutDashboard, Landmark, MapPin } from 'lucide-react';

export default function AdminPemdaLayout() {
  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin-pemda' },
    { icon: Landmark, label: 'Manajemen Pemda', path: '/admin-pemda/list' },
    { icon: MapPin, label: 'Wilayah', path: '/admin-pemda/regions' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)' }}>
      <Sidebar navItems={navItems} accentColor="#4ade80" roleName="Admin Pemda" />
      <div style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>
        <header className="page-header" style={{ 
          backgroundColor: '#fff', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#4ade80', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
              AP
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>Portal Admin Pemda</h1>
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
