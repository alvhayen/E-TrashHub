import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Leaf, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/form/Input';

const ROLES = [
  { value: 'RUMAH_TANGGA', label: 'Rumah Tangga' },
  { value: 'DRIVER', label: 'Driver / Pengepul' },
  { value: 'ADMIN_TPS3R', label: 'Admin TPS3R' },
  { value: 'MITRA_B2B', label: 'Mitra Industri / B2B' },
  { value: 'PEMDA', label: 'Pemda (Pemerintah)' }
];

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('RUMAH_TANGGA');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/register', { name, email, password, role });
      login(res.data.token, res.data.user);
      navigate(`/${res.data.user.role.toLowerCase()}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-primary)', padding: '2rem 1rem' }}>
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-secondary)' }}>Daftar Akun</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>Buat akun baru e-TrashHub</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Nama Lengkap</label>
            <input 
              type="text" 
              className="input" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Budi Santoso"
              required 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Alamat Surel (Email)</label>
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
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Kata Sandi</label>
            <input 
              type="password" 
              className="input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
              minLength={6}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Peran Pedaftaran</label>
            <select 
              className="input" 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              style={{ width: '100%' }}
            >
              {ROLES.map(r => (
                 <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <Button type="submit" size="lg" loading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            Daftar Sekarang
          </Button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Sudah punya akun?{' '}
          <button 
            type="button"
            onClick={() => navigate('/login')}
            style={{ 
              background: 'none', border: 'none', color: 'var(--color-primary)', 
              fontWeight: 600, cursor: 'pointer', padding: 0
            }}
            className="hover:underline"
          >
            Masuk di sini
          </button>
        </div>
      </div>
    </div>
  );
}
