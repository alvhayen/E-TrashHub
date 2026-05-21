import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, ShoppingBag, User } from 'lucide-react';

export default function MitraLayout() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <header style={{ 
        backgroundColor: '#153D32', 
        color: '#fff', 
        padding: '1rem 2rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={24} color="#34d399" /> Serene B2B
          </div>
          <nav style={{ display: 'flex', gap: '2rem' }}>
            <NavLink to="/mitra_b2b" end style={({isActive}) => ({ 
              color: isActive ? '#34d399' : 'rgba(255,255,255,0.7)', 
              textDecoration: 'none', 
              fontWeight: isActive ? 600 : 500,
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              transition: 'color 0.2s'
            })}>
              <ShoppingBag size={18} /> Katalog Material
            </NavLink>
            <NavLink to="/mitra_b2b/profile" style={({isActive}) => ({ 
              color: isActive ? '#34d399' : 'rgba(255,255,255,0.7)', 
              textDecoration: 'none', 
              fontWeight: isActive ? 600 : 500,
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              transition: 'color 0.2s'
            })}>
              <User size={18} /> Profil Perusahaan
            </NavLink>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ position: 'relative', display: 'none' }}>
            {/* Kept hidden for now as Catalog has its own large Hero Search */}
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#153D32' }} />
            <input 
              type="text" 
              placeholder="Pencarian cepat..." 
              style={{
                padding: '0.5rem 1rem 0.5rem 2.5rem',
                borderRadius: '9999px',
                border: 'none',
                outline: 'none',
                width: '200px',
                fontSize: '0.875rem'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right', display: 'none', '@media (min-width: 768px)': { display: 'block' } as any }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#34d399' }}>Mitra Industri</div>
            </div>
            <div style={{ 
              width: '2.5rem', height: '2.5rem', borderRadius: '50%', 
              backgroundColor: '#34d399', color: '#153D32', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontWeight: 800, fontSize: '1.25rem' 
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: '2rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>
    </div>
  );
}
