import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/form/Input';
import { User, MapPin, Phone, Mail, Award, LogOut, Ticket } from 'lucide-react';
import { pointsToRupiah } from '../../utils/points';

export default function Profile() {
  const { user, logout } = useAuth();
  const { success } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // In a real app we'd save these via API
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');

  const handleSave = () => {
    setIsEditing(false);
    success('Profil berhasil diperbarui');
    // Call API here to update profile if endpoint existed
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <header style={{ padding: '1.5rem', backgroundColor: 'var(--color-primary)', color: '#fff', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Profil & Akun</h1>
        
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

      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, marginTop: '-2rem' }}>
        <Card variant="default" style={{ zIndex: 5 }}>
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

        <section>
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
              <button 
                onClick={handleSave} 
                style={{ color: 'var(--color-primary)', background: 'transparent', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
              >
                Simpan
              </button>
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

        <section style={{ marginTop: '1rem' }}>
          <Button variant="danger" ghost fullWidth icon={LogOut} onClick={logout}>
            Keluar / Sign Out
          </Button>
        </section>
      </div>
    </div>
  );
}
