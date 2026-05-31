import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LeafNetworkBg from '../../components/backgrounds/LeafNetworkBg';
import axios from 'axios';

// Mapping role dari database (UPPERCASE) ke frontend (lowercase) dan ke path dashboard
const ROLE_ROUTE_MAP: Record<string, { frontendRole: any; path: string }> = {
  RUMAH_TANGGA: { frontendRole: 'rumah_tangga', path: '/household' },
  DRIVER:       { frontendRole: 'driver',        path: '/driver'    },
  ADMIN_TPS3R:  { frontendRole: 'admin_tps3r',   path: '/admin'     },
  CUSTOMER:    { frontendRole: 'customer',     path: '/customer'     },
  PEMDA:        { frontendRole: 'pemda',          path: '/pemda'     },
  SUPER_ADMIN:  { frontendRole: 'super_admin',    path: '/superadmin'},
};

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const oauthStatus = searchParams.get('status');
    const error = searchParams.get('error');

    if (error) {
      const messages: Record<string, string> = {
        oauth_cancelled: 'Login Google dibatalkan.',
        oauth_failed: 'Gagal login dengan Google. Coba lagi.',
        rejected: 'Akun Anda telah ditolak. Hubungi admin.',
        server_error: 'Terjadi kesalahan server. Coba lagi.',
      };
      setErrorMsg(messages[error] || 'Terjadi kesalahan.');
      setStatus('error');
      return;
    }

    if (!token) {
      setErrorMsg('Token tidak ditemukan.');
      setStatus('error');
      return;
    }

    if (oauthStatus === 'existing') {
      // Existing user — fetch their full profile then login
      axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          const userData = res.data.user;
          const mapping = ROLE_ROUTE_MAP[userData.role] || ROLE_ROUTE_MAP['RUMAH_TANGGA'];
          login(token, {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: mapping.frontendRole,
            status: 'active',
            address: userData.address,
            phone: userData.phone,
            points: userData.points,
            driverType: userData.driverType,
            tps3r_name: userData.tpsName,
          });
          navigate(mapping.path, { replace: true });
        })
        .catch(() => {
          setErrorMsg('Gagal memuat profil. Coba login lagi.');
          setStatus('error');
        });
    }
    // Note: new users (no status param) are handled by /auth/complete-profile
  }, [searchParams, navigate, login]);

  if (status === 'error') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a2318', position: 'relative' }}>
        <LeafNetworkBg accentColor="#4ade80" opacity={0.5} />
        <div style={{ zIndex: 10, textAlign: 'center', color: '#fff', maxWidth: '360px', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Autentikasi Gagal</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>{errorMsg}</p>
          <button onClick={() => navigate('/auth/login')} style={{ padding: '12px 32px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a2318', position: 'relative' }}>
      <LeafNetworkBg accentColor="#4ade80" opacity={0.5} />
      <div style={{ zIndex: 10, textAlign: 'center', color: '#fff' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid rgba(74,222,128,0.3)', borderTopColor: '#4ade80', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>Memproses login...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
