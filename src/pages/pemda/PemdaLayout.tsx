import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { LayoutDashboard, TrendingUp, ShieldCheck, FileText } from 'lucide-react';

export default function PemdaLayout() {
  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/pemda' },
    { icon: TrendingUp, label: 'Timbulan', path: '/pemda/volume' },
    { icon: ShieldCheck, label: 'Kepatuhan', path: '/pemda/compliance' },
    { icon: FileText, label: 'Laporan', path: '/pemda/reports' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)' }}>
      <Sidebar navItems={navItems} accentColor="#059669" roleName="Pemerintah Daerah" />
      <div style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>
        <header style={{ 
          backgroundColor: '#fff', 
          borderBottom: '1px solid var(--color-border)', 
          padding: '1.25rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#059669', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
              S
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>SIPSN-Bridge</h1>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Kota Surabaya</div>
            </div>
          </div>
        </header>

        <div style={{ padding: '2rem' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
