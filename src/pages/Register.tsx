import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Leaf, ArrowLeft, Shield, Info } from 'lucide-react';
import Button from '../components/ui/Button';
import LeafNetworkBg from '../components/backgrounds/LeafNetworkBg';

const ROLES = [
  { value: 'RUMAH_TANGGA', label: 'Rumah Tangga', description: 'Pesan jemputan sampah dan dapatkan poin reward.' },
  { value: 'DRIVER', label: 'Driver / Pengepul (Freelance)', description: 'Terima tugas penjemputan. Memerlukan persetujuan admin.' }
];

function getPasswordStrength(password: string): { level: number; label: string; color: string } {
  if (!password) return { level: 0, label: '', color: '#475569' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: 'Lemah', color: '#ef4444' };
  if (score <= 2) return { level: 2, label: 'Sedang', color: '#f59e0b' };
  if (score <= 3) return { level: 3, label: 'Cukup Kuat', color: '#3b82f6' };
  return { level: 4, label: 'Kuat', color: '#10B981' };
}

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('RUMAH_TANGGA');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const isDriverRole = role === 'DRIVER';
  const pwdStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/register', { name, email, password, role });
      const userData = res.data.user;

      // If the user is a driver, they're pending — show success and redirect to pending page
      if (userData.status === 'pending' || role === 'DRIVER') {
        login(res.data.token, { ...userData, status: userData.status || 'pending' });
        setSuccess(true);
        setTimeout(() => {
          navigate('/pending-approval');
        }, 2000);
      } else {
        // Rumah tangga — direct access
        login(res.data.token, { ...userData, status: userData.status || 'active' });
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
      setError(err.response?.data?.error || 'Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a2318', padding: '2rem 1rem', position: 'relative', overflow: 'hidden' }}>
      <LeafNetworkBg accentColor="#4ade80" opacity={0.9} />
      <div className="auth-page-content" style={{ backgroundColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', width: '100%', maxWidth: '420px', margin: '1rem', padding: '2rem', position: 'relative' }}>
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>Daftar Akun</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>Buat akun baru e-TrashHub</p>
        </div>

        {/* Security notice */}
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.625rem 0.75rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Shield size={14} color="#10B981" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
            Pendaftaran terbuka hanya untuk Rumah Tangga dan Driver Freelance. Role lain dikelola oleh administrator.
          </span>
        </div>

        {success && (
          <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ✅ Pendaftaran berhasil! Mengalihkan ke halaman persetujuan...
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#fff' }}>Nama Lengkap</label>
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
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#fff' }}>Alamat Surel (Email)</label>
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
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#fff' }}>Kata Sandi</label>
            <input 
              type="password" 
              className="input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              required 
              minLength={8}
            />
            {/* Password strength indicator */}
            {password && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '0.25rem' }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: '3px', borderRadius: '2px',
                      backgroundColor: i <= pwdStrength.level ? pwdStrength.color : 'rgba(255,255,255,0.15)',
                      transition: 'background-color 0.3s'
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.7rem', color: pwdStrength.color, fontWeight: 600 }}>
                  {pwdStrength.label}
                </span>
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#fff' }}>Peran Pendaftaran</label>
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
            {/* Role description */}
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.375rem', lineHeight: 1.4 }}>
              {ROLES.find(r => r.value === role)?.description}
            </p>
          </div>

          {/* Driver pending notice */}
          {isDriverRole && (
            <div style={{
              backgroundColor: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem'
            }}>
              <Info size={16} color="#fbbf24" style={{ marginTop: '1px', flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 700, marginBottom: '0.25rem' }}>Perlu Persetujuan Admin</p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, margin: 0 }}>
                  Akun Driver baru akan berstatus <strong style={{ color: '#fbbf24' }}>PENDING</strong> sampai diverifikasi oleh Admin TPS3R. Anda akan menerima notifikasi setelah disetujui.
                </p>
              </div>
            </div>
          )}

          <Button type="submit" size="lg" loading={loading} disabled={success} style={{ width: '100%', marginTop: '0.5rem' }}>
            {isDriverRole ? 'Daftar & Ajukan Verifikasi' : 'Daftar Sekarang'}
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
