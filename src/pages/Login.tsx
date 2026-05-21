import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Leaf, Users, ArrowLeft } from 'lucide-react';

export default function Login() {
  const location = useLocation();
  const [email, setEmail] = useState(() => location.state?.email || '');
  const [password, setPassword] = useState(() => location.state?.password || '');
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
      login(res.data.token, res.data.user);
      navigate(`/${res.data.user.role}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '1rem', position: 'relative' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '50%' }}
          className="hover:bg-slate-100"
          aria-label="Kembali"
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-md)', color: '#fff', marginBottom: '1rem' }}>
            <Leaf size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-secondary)' }}>e-TrashHub</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>Login to your account / Masuk ke akun Anda</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Email Address / Alamat Surel</label>
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
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Password / Kata Sandi</label>
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
