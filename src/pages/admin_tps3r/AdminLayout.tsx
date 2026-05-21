import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { LayoutDashboard, Inbox, Package, FileText } from 'lucide-react';

export default function AdminLayout() {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin_tps3r' },
    { icon: Inbox, label: 'Masuk', path: '/admin_tps3r/incoming' },
    { icon: Package, label: 'Inventori', path: '/admin_tps3r/inventory' },
    { icon: FileText, label: 'Laporan', path: '/admin_tps3r/reports' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)' }}>
      <Sidebar navItems={navItems} accentColor="var(--role-admin)" roleName="Admin TPS3R" />
      <div style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
}
