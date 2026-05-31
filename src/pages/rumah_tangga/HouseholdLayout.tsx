import React from 'react';
import { Outlet } from 'react-router-dom';
import { Home, PackagePlus, FileText, User, Wallet } from 'lucide-react';
import BottomNav from '../../components/layout/BottomNav';
import Sidebar from '../../components/layout/Sidebar';
import NotificationBell from '../../components/ui/NotificationBell';

export default function HouseholdLayout() {
  const navItems = [
    { icon: Home, label: 'Beranda', path: '/household' },
    { icon: PackagePlus, label: 'Jemput', path: '/household/request' },
    { icon: FileText, label: 'Riwayat', path: '/household/history' },
    { icon: Wallet, label: 'Tukar Poin', path: '/household/redeem' },
    { icon: User, label: 'Akun', path: '/household/profile' }
  ];

  return (
    <div className="responsive-layout">
      {/* Sidebar — only visible on desktop (≥1024px) */}
      <div className="sidebar-desktop-only">
        <Sidebar
          navItems={navItems}
          accentColor="var(--role-rumah-tangga)"
          roleName="Rumah Tangga"
        />
      </div>

      {/* Main content area */}
      <div className="mobile-content-wrapper">
        {/* Notification Bell */}
        <div className="notif-bell-wrapper">
          <NotificationBell />
        </div>

        {/* Page content with bottom padding for BottomNav on mobile */}
        <div style={{ paddingBottom: 'var(--bottom-nav-height, 80px)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
          className="desktop-no-bottom-padding">
          <Outlet />
        </div>

        {/* BottomNav — only visible on mobile (<1024px) */}
        <div className="bottom-nav-wrapper">
          <BottomNav navItems={navItems} accentColor="var(--role-rumah-tangga)" />
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .desktop-no-bottom-padding {
            padding-bottom: 0 !important;
          }
          .notif-bell-wrapper {
            position: sticky;
            top: 0;
            right: 0;
            display: flex;
            justify-content: flex-end;
            padding: 1rem 2rem;
            background: var(--color-bg-primary);
            z-index: 10;
          }
        }
      `}</style>
    </div>
  );
}
