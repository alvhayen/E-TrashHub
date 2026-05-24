import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { LayoutDashboard, CheckSquare, Users, Settings } from 'lucide-react';

export default function SuperAdminLayout() {
  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/superadmin' },
    { icon: CheckSquare, label: 'Antrian Verifikasi', path: '/superadmin/verification' },
    { icon: Users, label: 'Semua Pengguna', path: '/superadmin/users' },
    { icon: Settings, label: 'Pengaturan', path: '/superadmin/settings' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar with dark theme #0f172a */}
      <div style={{ width: '250px', flexShrink: 0, backgroundColor: '#0f172a' }}>
        <Sidebar 
          navItems={navItems} 
          accentColor="#3b82f6" 
          roleName="Super Admin"
          customTheme={{
            bg: '#0f172a',
            text: '#f8fafc',
            textMuted: '#94a3b8',
            hover: 'rgba(59, 130, 246, 0.1)',
            active: '#3b82f6'
          }}
        />
      </div>
      <div style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
}
