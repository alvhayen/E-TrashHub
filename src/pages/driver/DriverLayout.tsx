import React from 'react';
import { Outlet } from 'react-router-dom';
import { Truck, Map, CheckCircle, User } from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';

export default function DriverLayout() {
  const navItems = [
    { icon: Truck, label: 'Tugas', path: '/driver' },
    { icon: Map, label: 'Rute', path: '/driver/route' },
    { icon: CheckCircle, label: 'Selesai', path: '/driver/completed' },
    { icon: User, label: 'Profil', path: '/driver/profile' }
  ];

  return (
    <div style={{ 
      maxWidth: '480px', 
      margin: '0 auto', 
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg-primary)',
      position: 'relative',
      overflowX: 'hidden',
      boxShadow: '0 0 20px rgba(0,0,0,0.05)'
    }}>
      <div style={{ paddingBottom: '80px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </div>
      <BottomNav navItems={navItems} accentColor="var(--role-driver)" />
    </div>
  );
}
