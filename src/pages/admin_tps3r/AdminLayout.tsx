import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { LayoutDashboard, Inbox, Package, FileText, HelpCircle, Scale, Truck, Users, Activity } from 'lucide-react';

export default function AdminLayout() {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Scale, label: 'Timbang & Verifikasi', path: '/admin/incoming' },
    { icon: Package, label: 'Manajemen Stok', path: '/admin/stock' },
    { icon: Truck, label: 'Manajemen Pengiriman', path: '/admin/shipment' },
    { icon: Users, label: 'Manajemen Driver', path: '/admin/drivers' },
    { icon: Activity, label: 'Aktivitas Driver', path: '/admin/driver-activity' },
    { icon: FileText, label: 'Laporan', path: '/admin/reports' }
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
