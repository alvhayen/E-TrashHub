import React from 'react';
import { Outlet } from 'react-router-dom';
import { Truck, Map, CheckCircle, User, Package, Wallet } from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/AuthContext';

export default function DriverLayout() {
  const { user } = useAuth();
  const isMitra = user?.driverType === 'MITRA_TPS3R';

  const navItems = [
    { icon: Truck, label: 'Tugas', path: '/driver' },
    { icon: Map, label: 'Rute', path: '/driver/route' },
    ...(isMitra ? [{ icon: Package, label: 'Ekspedisi', path: '/driver/expedition' }] : []),
    { icon: CheckCircle, label: 'Selesai', path: '/driver/completed' },
    { icon: Wallet, label: 'Tukar Poin', path: '/driver/redeem' },
    { icon: User, label: 'Profil', path: '/driver/profile' }
  ];

  return (
    <div className="responsive-layout">
      {/* Sidebar — only visible on desktop (≥1024px) */}
      <div className="sidebar-desktop-only">
        <Sidebar
          navItems={navItems}
          accentColor="var(--role-driver)"
          roleName="Driver / Pengepul"
        />
      </div>

      {/* Main content area */}
      <div className="mobile-content-wrapper">
        {/* Page content with bottom padding for BottomNav on mobile */}
        <div style={{ paddingBottom: 'var(--bottom-nav-height, 80px)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
          className="desktop-no-bottom-padding">
          <Outlet />
        </div>

        {/* BottomNav — only visible on mobile (<1024px) */}
        <div className="bottom-nav-wrapper">
          <BottomNav navItems={navItems} accentColor="var(--role-driver)" />
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .desktop-no-bottom-padding {
            padding-bottom: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
