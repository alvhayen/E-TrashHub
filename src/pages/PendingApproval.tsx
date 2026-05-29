import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, ShieldCheck, LogOut, Mail, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import LeafNetworkBg from '../components/backgrounds/LeafNetworkBg';

export default function PendingApproval() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // TODO: RESTORE AUTH — navigate('/login');
    navigate('/');
  };

  const roleLabel = user?.role === 'DRIVER' ? 'Driver / Pengepul' : user?.role?.replace('_', ' ') || 'Pengguna';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a2318', position: 'relative', overflow: 'hidden' }}>
      <LeafNetworkBg accentColor="#4ade80" opacity={0.9} />

      <div className="auth-page-content" style={{
        backgroundColor: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '1.5rem',
        width: '100%',
        maxWidth: '480px',
        margin: '1rem',
        padding: '2.5rem 2rem',
        position: 'relative',
        textAlign: 'center'
      }}>
        {/* Animated pending icon */}
        <div style={{
          width: '100px', height: '100px', borderRadius: '50%',
          backgroundColor: 'rgba(251, 191, 36, 0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 2rem', position: 'relative'
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            borderRadius: '50%', border: '3px solid rgba(251, 191, 36, 0.3)',
            animation: 'pending-pulse 2.5s ease-in-out infinite'
          }} />
          <Clock size={48} color="#fbbf24" />
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem', lineHeight: 1.2 }}>
          Menunggu Persetujuan
        </h1>

        <div style={{
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          border: '1px solid rgba(251, 191, 36, 0.25)',
          borderRadius: '0.75rem',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <ShieldCheck size={16} color="#fbbf24" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24', letterSpacing: '0.05em' }}>
            STATUS: PENDING APPROVAL
          </span>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          Halo <strong style={{ color: '#fff' }}>{user?.name || 'Pengguna'}</strong>,
          akun Anda sebagai <strong style={{ color: '#4ade80' }}>{roleLabel}</strong> telah berhasil didaftarkan.
        </p>

        <div style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: '0.75rem',
          padding: '1.25rem',
          marginBottom: '2rem',
          textAlign: 'left'
        }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
            Langkah selanjutnya:
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                backgroundColor: '#10B981', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 800, flexShrink: 0
              }}>✓</div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                Pendaftaran akun berhasil
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                backgroundColor: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 800, flexShrink: 0,
                border: '2px solid #fbbf24',
                animation: 'pending-dot 2s ease-in-out infinite'
              }}>2</div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                <strong style={{ color: '#fbbf24' }}>Menunggu verifikasi</strong> oleh Admin TPS3R terdekat di wilayah Anda
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 800, flexShrink: 0
              }}>3</div>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                Setelah disetujui, Anda dapat mulai menerima tugas penjemputan
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <Mail size={18} color="#10B981" style={{ flexShrink: 0 }} />
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', lineHeight: 1.5, margin: 0, textAlign: 'left' }}>
            Anda akan menerima notifikasi email di <strong style={{ color: '#10B981' }}>{user?.email || 'email Anda'}</strong> setelah akun diaktifkan.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Button
            variant="outline"
            size="lg"
            icon={ArrowLeft}
            // TODO: RESTORE AUTH — onClick={() => navigate('/login')}
            onClick={() => navigate('/')}
            style={{ width: '100%', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            Kembali ke Login
          </Button>
          <button
            onClick={handleLogout}
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.5rem'
            }}
          >
            <LogOut size={14} />
            Keluar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pending-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0.2; }
        }
        @keyframes pending-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
