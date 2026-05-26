import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function LoginGateModal({ contextAction, targetRole, onClose }) {
  const navigate = useNavigate();

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }} onClick={onClose}>
      
      <div style={{
        background: 'white', borderRadius: '24px', padding: '32px',
        width: '100%', maxWidth: '400px', textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        animation: 'scaleIn 0.2s ease-out forwards'
      }} onClick={e => e.stopPropagation()}>
        
        <div style={{
          width: '56px', height: '56px', background: '#f0fdf4', color: '#10B981',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <Lock size={28} />
        </div>
        
        <h2 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.5rem', fontWeight: 800,
          color: '#111827', margin: '0 0 12px'
        }}>Satu langkah lagi!</h2>
        
        <p style={{
          color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.5, margin: '0 0 32px'
        }}>
          Masuk atau daftar untuk {contextAction}.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {/* TODO: RESTORE AUTH — navigate(`/auth/login?role=${targetRole}`) */}
          <button 
            onClick={() => navigate(`/role-onboarding/${targetRole}`)}
            style={{
              background: '#10B981', color: 'white', border: 'none', padding: '14px',
              borderRadius: '12px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer'
            }}
          >
            Masuk
          </button>
          
          {/* TODO: RESTORE AUTH — navigate(`/auth/register/${targetRole}`) */}
          <button 
            onClick={() => navigate(`/role-onboarding/${targetRole}`)}
            style={{
              background: 'transparent', color: '#10B981', border: '1.5px solid #10B981', padding: '14px',
              borderRadius: '12px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer'
            }}
          >
            Daftar Gratis
          </button>
        </div>
        
        <button 
          onClick={onClose}
          style={{
            background: 'none', border: 'none', color: '#9ca3af', fontWeight: 500,
            fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline'
          }}
        >
          Lanjut jelajah tanpa akun
        </button>
        
      </div>
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
