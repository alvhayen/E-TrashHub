import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Leaf, Users, ArrowLeft } from 'lucide-react';
import LeafNetworkBg from '../components/backgrounds/LeafNetworkBg';

export default function Login() {
  const location = useLocation();
  const [email, setEmail] = useState(() => location.state?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const userData = { ...res.data.user, status: res.data.user.status || 'active' };
      login(res.data.token, userData);

      // Redirect pending users to the approval waiting page
      if (userData.status === 'pending') {
        navigate('/pending-approval');
      } else if (userData.status === 'suspended') {
        setError('Akun Anda telah dinonaktifkan. Hubungi administrator untuk informasi lebih lanjut.');
        return;
      } else {
        navigate(`/${userData.role}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal masuk. Periksa email dan kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a2318', position: 'relative', overflow: 'hidden' }}>
      <LeafNetworkBg accentColor="#4ade80" opacity={0.9} />
      <div className="auth-page-content" style={{ backgroundColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', width: '100%', maxWidth: '400px', margin: '1rem', padding: '2rem', position: 'relative' }}>
        <button 
          onClick={() => navigate('/roles')}
          style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '50%' }}
          className="hover:bg-white/20"
          aria-label="Kembali ke Pilihan Peran"
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', backgroundColor: '#10B981', borderRadius: '0.5rem', color: '#fff', marginBottom: '1rem' }}>
            <Leaf size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>e-TrashHub</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>Login to your account / Masuk ke akun Anda</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#fff' }}>Email Address / Alamat Surel</label>
            <input 
              type="email" 
              className="input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#fff' }}>Password / Kata Sandi</label>
            <input 
              type="password" 
              className="input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
            Belum punya akun?{' '}
            <button 
              type="button"
              onClick={() => navigate('/register')}
              style={{ 
                background: 'none', border: 'none', color: 'var(--color-primary)', 
                fontWeight: 600, cursor: 'pointer', padding: 0
              }}
              className="hover:underline"
            >
              Daftar di sini
            </button>
          </div>
          <button 
            type="button"
            onClick={() => navigate('/roles')}
            style={{ 
              background: 'none', border: 'none', color: 'var(--color-primary)', 
              fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%'
            }}
            className="hover:underline"
          >
            <Users size={16} />
            Gunakan Akun Demo (Pilih Peran)
          </button>
        </div>
      </div>
    </div>
  );
}
