import React, { useState } from 'react';

// TODO: RESTORE AUTH — hapus komponen ini setelah auth selesai dibangun ulang

const ROLES = [
  { key: 'RUMAH_TANGGA', label: '🏠 Rumah Tangga', path: '/household/home'       },
  { key: 'DRIVER',       label: '🚛 Driver',       path: '/driver/tasks'         },
  { key: 'ADMIN_TPS3R',  label: '🏭 Admin TPS3R',  path: '/admin/dashboard'      },
  { key: 'CUSTOMER',    label: '🏢 Customer',    path: '/customer/catalog'        },
  { key: 'PEMDA',        label: '🏛️ Pemda',        path: '/pemda/overview'       },
  { key: 'SUPER_ADMIN',  label: '⚙️ Super Admin',  path: '/superadmin/overview'  },
];

export default function RoleSwitcher() {
  // Only show in development mode
  if (typeof import.meta !== 'undefined' && import.meta.env && !import.meta.env.DEV) return null;

  const [open, setOpen] = useState(false);
  const current = localStorage.getItem('dev_mock_role') || 'RUMAH_TANGGA';

  function switchRole(key: string, path: string) {
    localStorage.setItem('dev_mock_role', key);
    window.location.href = path;
  }

  const currentLabel = ROLES.find(r => r.key === current)?.label ?? current;

  return (
    <div style={{
      position: 'fixed',
      bottom: '88px',
      left: '12px',
      zIndex: 9999,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: '11px'
    }}>
      {open && (
        <div style={{
          background: '#1e293b',
          borderRadius: '10px',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column' as const,
          gap: '4px',
          marginBottom: '6px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ color: '#94a3b8', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', padding: '2px 8px', marginBottom: '2px' }}>
            🔧 Dev Role Switcher
          </div>
          {ROLES.map(r => (
            <button
              key={r.key}
              onClick={() => switchRole(r.key, r.path)}
              style={{
                background: current === r.key ? '#10B981' : '#334155',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                textAlign: 'left' as const,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                fontWeight: current === r.key ? 700 : 400,
                transition: 'background 0.15s'
              }}
            >
              {r.label}{current === r.key ? ' ✓' : ''}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: '#1e293b',
          color: '#10B981',
          border: '1px solid #10B981',
          borderRadius: '8px',
          padding: '5px 10px',
          cursor: 'pointer',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '11px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.3)'
        }}
      >
        {open ? '✕ tutup' : '⚙️ ' + currentLabel}
      </button>
    </div>
  );
}
