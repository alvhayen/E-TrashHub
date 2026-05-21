import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div style={{ flex: 1, height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '2rem' }}>
      <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '50%', backgroundColor: '#fca5a5', opacity: 0.5, animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
        <Lock size={64} color="#dc2626" style={{ position: 'relative', zIndex: 1 }} />
      </div>
      
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', textAlign: 'center' }}>Akses Ditolak</h1>
      
      <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', textAlign: 'center', maxWidth: '500px', marginBottom: '2.5rem', lineHeight: 1.6 }}>
        Maaf, akun Anda saat ini terdaftar sebagai <strong>{user?.role?.toUpperCase().replace('_', ' ') || 'Pengguna'}</strong>. Anda tidak memiliki izin yang diperlukan untuk mengakses halaman ini.
      </p>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button variant="outline" icon={ArrowLeft} onClick={() => navigate(-1)}>
          Kembali Sebelumnya
        </Button>
        <Button 
          style={{ backgroundColor: '#0f172a' }}
          onClick={() => {
            if (user?.role) {
              navigate(`/${user.role}`);
            } else {
              navigate('/login');
            }
          }}
        >
          Ke Dasbor Saya
        </Button>
      </div>

      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
