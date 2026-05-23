import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { useApi } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/form/Input';
import { User, MapPin, Phone, Mail, Award, LogOut, Ticket } from 'lucide-react';
import { pointsToRupiah } from '../../utils/points';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const { success, error } = useToast();
  const { request, loading } = useApi();
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');

  const handleSave = async () => {
    try {
      const res = await request('PUT', '/api/auth/profile', { name, phone, address });
      if (res && res.user) {
        updateUser(res.user);
        setIsEditing(false);
        success('Profil berhasil diperbarui');
      }
    } catch (err: any) {
      error(err?.response?.data?.error || 'Gagal memperbarui profil');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Profile Header */}
      <header style={{ padding: '2rem 1.5rem', backgroundColor: 'var(--color-primary)', color: '#fff', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Profil &amp; Akun</h1>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '5rem', height: '5rem', borderRadius: '50%', 
            backgroundColor: '#fff', color: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 800, border: '4px solid rgba(255,255,255,0.2)'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user?.name}</div>
            <div style={{ opacity: 0.8, fontSize: '0.875rem' }}>Rumah Tangga</div>
          </div>
        </div>
      </header>

      {/* Responsive content area */}
      <div className="profile-desktop-grid" style={{ flex: 1, marginTop: '-2rem' }}>
        {/* Points card */}
        <Card variant="default" style={{ zIndex: 5, marginBottom: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-tertiary)', borderRadius: 'var(--radius-full)' }}>
              <Award size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Total Poin Saya</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{user?.points?.toLocaleString()}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Nilai Setara</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>Rp {pointsToRupiah(user?.points || 0).toLocaleString()}</div>
            </div>
          </div>
        </Card>

        {/* Personal info */}
        <section style={{ paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Informasi Pribadi</h2>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)} 
                style={{ color: 'var(--color-primary)', background: 'transparent', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
              >
                Ubah
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button 
                  onClick={() => { setIsEditing(false); setName(user?.name || ''); setPhone(user?.phone || ''); setAddress(user?.address || ''); }}
                  disabled={loading}
                  style={{ color: 'var(--color-text-secondary)', background: 'transparent', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: loading ? 'wait' : 'pointer' }}
                >
                  Batal
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={loading}
                  style={{ color: 'var(--color-primary)', background: 'transparent', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: loading ? 'wait' : 'pointer' }}
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            )}
          </div>
          
          <Card variant="bordered" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {isEditing ? (
              <>
                <Input label="Nama Lengkap" value={name} onChange={e => setName(e.target.value)} icon={User} />
                <Input label="Nomor Telepon" value={phone} onChange={e => setPhone(e.target.value)} icon={Phone} />
                <Input label="Alamat Rumah" value={address} onChange={e => setAddress(e.target.value)} icon={MapPin} />
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Mail size={18} color="var(--color-text-secondary)" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Email</div>
                    <div style={{ fontWeight: 500 }}>{user?.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Phone size={18} color="var(--color-text-secondary)" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Nomor Telepon</div>
                    <div style={{ fontWeight: 500 }}>{user?.phone || 'Belum diatur'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                  <MapPin size={18} color="var(--color-text-secondary)" style={{ marginTop: '0.25rem' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Alamat Rumah</div>
                    <div style={{ fontWeight: 500 }}>{user?.address || 'Belum diatur'}</div>
                  </div>
                </div>
              </>
            )}
          </Card>
        </section>

        {/* Logout */}
        <section style={{ paddingBottom: '2rem' }}>
          <Button variant="danger" ghost fullWidth icon={LogOut} onClick={logout}>
            Keluar / Sign Out
          </Button>
        </section>
      </div>

      <style>{`
        .profile-desktop-grid {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 1.5rem;
        }
        @media (min-width: 1024px) {
          .profile-desktop-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto 1fr auto;
            gap: 1.5rem 2rem;
            padding: 2rem 2.5rem;
            align-items: start;
          }
        }
      `}</style>
    </div>
  );
}
