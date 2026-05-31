import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, ShoppingBag, User, HelpCircle, Menu, X, LogOut, Package } from 'lucide-react';

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: ShoppingBag, label: 'Katalog Material', path: '/customer/catalog' },
    ...(user ? [{ icon: Package, label: 'Pesanan Saya', path: '/customer/orders' }] : []),
    { icon: HelpCircle, label: 'FAQ', path: '/customer/faq' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <header style={{ 
        backgroundColor: '#153D32', 
        color: '#fff', 
        padding: '1rem 1.5rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
      }}>
        {/* Brand */}
        <div style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingBag size={24} color="#34d399" /> Marketplace
        </div>

        {/* Desktop nav */}
        <nav className="customer-desktop-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/customer'}
              style={({ isActive }) => ({ 
                color: isActive ? '#34d399' : 'rgba(255,255,255,0.7)', 
                textDecoration: 'none', 
                fontWeight: isActive ? 600 : 500,
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                transition: 'color 0.2s'
              })}
            >
              <item.icon size={18} /> {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop user info */}
        {/* Desktop user info */}
        {user ? (
          <div className="customer-desktop-user" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#34d399' }}>Customer</div>
            </div>
            <div style={{ 
              width: '2.5rem', height: '2.5rem', borderRadius: '50%', 
              backgroundColor: '#34d399', color: '#153D32', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontWeight: 800, fontSize: '1.25rem' 
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={logout}
              title="Keluar"
              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '0.25rem' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="customer-desktop-user" style={{ display: 'flex', alignItems: 'center' }}>
            <NavLink to="/auth/login?role=CUSTOMER" style={{
              background: '#34d399', color: '#153D32', border: 'none', padding: '0.5rem 1rem',
              borderRadius: '9999px', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <User size={16} /> Masuk / Daftar
            </NavLink>
          </div>
        )}

        {/* Mobile hamburger */}
        <button
          className="customer-mobile-menu-btn"
          onClick={() => setMobileMenuOpen(v => !v)}
          style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </header>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="customer-mobile-menu" style={{
          backgroundColor: '#1a4a3d',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          position: 'sticky',
          top: '57px',
          zIndex: 49,
        }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '0.5rem' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: '#34d399', color: '#153D32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#fff' }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#34d399' }}>Customer</div>
              </div>
            </div>
          )}
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/customer'}
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 0.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                color: isActive ? '#34d399' : 'rgba(255,255,255,0.8)',
                fontWeight: isActive ? 700 : 500,
                backgroundColor: isActive ? 'rgba(52, 211, 153, 0.1)' : 'transparent',
                transition: 'all 0.2s'
              })}
            >
              <item.icon size={20} /> {item.label}
            </NavLink>
          ))}
          {user ? (
            <button
              onClick={() => { setMobileMenuOpen(false); logout(); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0.5rem', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', borderRadius: '0.5rem', marginTop: '0.25rem' }}
            >
              <LogOut size={18} /> Keluar / Sign Out
            </button>
          ) : (
            <NavLink
              to="/auth/login?role=CUSTOMER"
              onClick={() => setMobileMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0.5rem', background: 'transparent', border: 'none', color: '#34d399', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', borderRadius: '0.5rem', marginTop: '0.25rem', textDecoration: 'none', fontWeight: 600 }}
            >
              <User size={18} /> Masuk / Daftar
            </NavLink>
          )}
        </div>
      )}

      <main style={{ flex: 1, padding: '1.5rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}
        className="customer-main">
        <Outlet />
      </main>

      <style>{`
        .customer-desktop-nav {
          display: none;
          gap: 2rem;
        }
        .customer-desktop-user {
          display: none !important;
        }
        .customer-mobile-menu-btn {
          display: flex !important;
        }
        .customer-mobile-menu {
          display: flex;
        }
        @media (min-width: 768px) {
          .customer-desktop-nav {
            display: flex;
          }
          .customer-desktop-user {
            display: flex !important;
          }
          .customer-mobile-menu-btn {
            display: none !important;
          }
          .customer-mobile-menu {
            display: none !important;
          }
        }
        @media (min-width: 1024px) {
          .customer-main {
            padding: 2rem 2.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
