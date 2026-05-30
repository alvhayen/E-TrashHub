import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Leaf, ArrowLeft, Users } from 'lucide-react';
import LeafNetworkBg from '../../components/backgrounds/LeafNetworkBg';

export default function Login() {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showEyePassword, setShowEyePassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const getRoleLabel = (r: string) => {
    const roles: Record<string, string> = {
      RUMAH_TANGGA: 'Rumah Tangga',
      DRIVER: 'Driver',
      ADMIN_TPS3R: 'Admin TPS3R',
      MITRA_B2B: 'Mitra Industri',
      PEMDA: 'Pemda'
    };
    return roles[r] || r;
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const res = await axios.get('/api/auth/google');
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch {
      setError('Gagal menghubungi server. Coba lagi.');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const userData = res.data.user;
      
      login(res.data.token, userData);

      // Handle redirect
      if (userData.verificationStatus === 'PENDING') {
        navigate('/auth/pending-verification');
      } else if (userData.role === 'SUPER_ADMIN') {
        navigate('/superadmin');
      } else {
        const roleRoutes: Record<string, string> = {
          RUMAH_TANGGA: 'household',
          DRIVER: 'driver',
          ADMIN_TPS3R: 'admin',
          MITRA_B2B: 'mitra',
          PEMDA: 'pemda',
          SUPER_ADMIN: 'superadmin'
        };
        const targetPath = roleRoutes[userData.role.toUpperCase()] || userData.role.toLowerCase();
        navigate(`/${targetPath}`);
      }
    } catch (err: any) {
      if (err.response?.data?.code === 'PENDING_VERIFICATION') {
        navigate('/auth/pending-verification');
      } else if (err.response?.data?.code === 'REJECTED') {
        setError(`Akun Anda ditolak. Catatan: ${err.response.data.notes || 'Hubungi admin.'}`);
      } else {
        setError(err.response?.data?.error || 'Gagal masuk. Periksa email dan kata sandi Anda.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a2318', position: 'relative', overflow: 'hidden' }}>
      <LeafNetworkBg accentColor="#4ade80" opacity={0.9} />
      <div className="auth-page-content" style={{ backgroundColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', width: '100%', maxWidth: '400px', margin: '1rem', padding: '2.5rem', position: 'relative', zIndex: 10 }}>
        
        <button 
          onClick={() => navigate(-1)}
          style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '50%' }}
          aria-label="Kembali"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', backgroundColor: '#10B981', borderRadius: '1rem', color: '#fff', marginBottom: '1rem' }}>
            <Leaf size={28} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>e-TrashHub</h1>
          
          {roleParam ? (
            <div style={{ marginTop: '0.75rem', display: 'inline-block', background: 'rgba(16, 185, 129, 0.15)', color: '#a7f3d0', padding: '4px 12px', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              Masuk sebagai {getRoleLabel(roleParam)}
            </div>
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>Masuk ke akun Anda</p>
          )}
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.875rem', lineHeight: 1.5 }}>
            {error}
          </div>
        )}

        {/* Tombol Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          style={{
            width: '100%', padding: '13px 16px', borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.07)',
            color: '#ffffff', fontWeight: 600, fontSize: '0.95rem', cursor: googleLoading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            marginBottom: '1.5rem', opacity: googleLoading ? 0.7 : 1, transition: 'background 0.2s',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {googleLoading ? 'Menghubungkan...' : 'Masuk dengan Google'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.15)' }} />
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.05em' }}>ATAU</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.15)' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#fff' }}>Email</label>
            <input 
              type="email" 
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#fff' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showEyePassword ? "text" : "password"} 
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required 
              />
              <button
                type="button"
                onClick={() => setShowEyePassword(!showEyePassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
              >
                {showEyePassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ 
            width: '100%', marginTop: '1rem', padding: '14px', background: '#10B981', color: 'white',
            border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, transition: 'background 0.2s'
          }}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>
            Belum punya akun?{' '}
            <button 
              type="button"
              onClick={() => navigate(roleParam ? `/auth/register/${roleParam}` : '/')}
              style={{ background: 'none', border: 'none', color: '#34d399', fontWeight: 600, cursor: 'pointer', padding: 0 }}
            >
              Daftar di sini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
