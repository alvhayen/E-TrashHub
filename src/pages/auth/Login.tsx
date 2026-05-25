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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#fff' }}>Email Address</label>
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
            <input 
              type="password" 
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>

          <button type="submit" disabled={loading} style={{ 
            width: '100%', marginTop: '1rem', padding: '14px', background: '#10B981', color: 'white',
            border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, transition: 'background 0.2s'
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
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
