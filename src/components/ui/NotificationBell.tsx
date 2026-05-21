import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export default function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: 'none', border: 'none', cursor: 'pointer', 
          position: 'relative', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-text-secondary)', borderRadius: '50%', transition: 'background-color 0.2s' 
        }}
        className="hover:bg-slate-100"
        aria-label="Notifikasi"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute', top: '2px', right: '4px',
            backgroundColor: '#ef4444', color: '#fff',
            fontSize: '0.65rem', fontWeight: 800,
            width: '18px', height: '18px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: '0',
          width: '320px', maxHeight: '400px', overflowY: 'auto',
          backgroundColor: '#fff', borderRadius: 'var(--radius-lg)',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
          border: '1px solid var(--color-border)',
          zIndex: 50, marginTop: '0.5rem',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Notifikasi</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>
                Tandai semua dibaca
              </button>
            )}
          </div>
          <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                Belum ada notifikasi
              </div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => markAsRead(n.id)}
                  style={{ 
                    padding: '0.75rem', borderRadius: 'var(--radius-md)', 
                    backgroundColor: n.read ? '#fff' : '#f0fdf4',
                    cursor: 'pointer', transition: 'background-color 0.2s',
                    border: '1px solid', borderColor: n.read ? 'transparent' : '#dcfce7'
                  }}
                  className="hover:bg-slate-50"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: n.read ? 600 : 700, color: '#0f172a' }}>{n.title}</div>
                    {!n.read && <div style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }} />}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{n.message}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem', opacity: 0.8 }}>
                    {new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }).format(n.timestamp)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
