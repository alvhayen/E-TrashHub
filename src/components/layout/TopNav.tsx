import React from 'react';
import { Search, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopNavProps {
  title: string;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

export default function TopNav({ title, showSearch, onSearch }: TopNavProps) {
  const { user, logout } = useAuth();

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-border)',
      height: '4rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{title}</h2>
      </div>

      {showSearch && (
        <div style={{ flex: 1, maxWidth: '400px', margin: '0 2rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search..."
              onChange={(e) => onSearch?.(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 1rem 0.5rem 2.5rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-primary)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user?.name}</div>
          <div style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
