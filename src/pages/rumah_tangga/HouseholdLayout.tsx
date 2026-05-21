import React from 'react';
import { Outlet } from 'react-router-dom';
import { Home, PackagePlus, FileText, User } from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';
import NotificationBell from '../../components/ui/NotificationBell';

export default function HouseholdLayout() {
  const navItems = [
    { icon: Home, label: 'Beranda', path: '/rumah_tangga' },
    { icon: PackagePlus, label: 'Jemput', path: '/rumah_tangga/request' },
    { icon: FileText, label: 'Riwayat', path: '/rumah_tangga/history' },
    { icon: User, label: 'Akun', path: '/rumah_tangga/profile' }
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
      <div style={{ position: 'fixed', top: '1rem', right: '50%', transform: 'translateX(220px)', zIndex: 50 }}>
         {window.innerWidth <= 480 ? 
           <div style={{ position: 'absolute', right: '-210px' }}><NotificationBell /></div> : 
           <NotificationBell />
         }
      </div>
      <div style={{ paddingBottom: '80px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </div>
      <BottomNav navItems={navItems} accentColor="var(--role-rumah-tangga)" />
    </div>
  );
}
