import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Truck, MapPin, LogOut, Coins, Edit2, X, Phone, User as UserIcon } from 'lucide-react';
import { pointsToRupiah } from '../../utils/points';

export default function DriverProfile() {
  const { user, logout, updateUser } = useAuth();
  const { request, loading } = useApi();
  const { success, error } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    vehicleType: user?.vehicleType || '',
    vehiclePlate: user?.vehiclePlate || '',
    domicile: user?.domicile || user?.zone || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await request('PUT', '/api/auth/profile', formData);
      if (res.user) {
        updateUser(res.user);
        success('Profil berhasil diperbarui!');
        setIsEditing(false);
      }
    } catch (err: any) {
      error(err.response?.data?.error || 'Gagal memperbarui profil');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', backgroundColor: '#f8fafc' }}>
      {/* Profile Header */}
      <header style={{ padding: '2rem 1.5rem', backgroundColor: 'var(--role-driver)', color: '#fff', textAlign: 'center' }}>
        <div style={{ 
          width: '5.5rem', height: '5.5rem', borderRadius: '50%', 
          backgroundColor: '#fff', color: 'var(--role-driver)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.5rem', fontWeight: 800, border: '4px solid rgba(255,255,255,0.2)',
          margin: '0 auto 1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{user?.name}</div>
        <div style={{ opacity: 0.9, fontSize: '0.875rem', fontWeight: 500 }}>
          {user?.driverType === 'MITRA_TPS3R' ? '🏭 Driver Mitra TPS3R' : '🚛 Driver Freelance'}
        </div>
      </header>

      <div className="driver-profile-content">
        <Card variant="elevated" padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', zIndex: 1, backgroundColor: '#fff', position: 'relative' }}>
          
          <button 
            onClick={() => setIsEditing(true)}
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--role-driver)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}
          >
            <Edit2 size={14} /> Edit Profil
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: '#ccfbf1', color: 'var(--role-driver)', borderRadius: 'var(--radius-full)' }}>
              <Coins size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Total Poin Dikumpulkan</div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--color-primary)' }}>
                {user?.points || 0} Pds <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>({pointsToRupiah(user?.points || 0)})</span>
              </div>
            </div>
          </div>
          
          <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: '#e0e7ff', color: '#4f46e5', borderRadius: 'var(--radius-full)' }}>
              <UserIcon size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Informasi Kontak</div>
              <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{user?.phone || <span style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', fontWeight: 400 }}>Belum diisi</span>}</div>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: '#fef3c7', color: '#d97706', borderRadius: 'var(--radius-full)' }}>
              <Truck size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Kendaraan Armada</div>
              <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {user?.vehicleType && user?.vehiclePlate 
                  ? `${user.vehicleType} (${user.vehiclePlate})`
                  : <span style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', fontWeight: 400 }}>Belum diisi</span>
                }
              </div>
            </div>
          </div>
          
          <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: 'var(--radius-full)' }}>
              <MapPin size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Zona Operasional</div>
              <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {user?.domicile || user?.zone || 
                  <span style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', fontWeight: 400 }}>Belum diisi</span>
                }
              </div>
            </div>
          </div>
        </Card>

        <section style={{ marginTop: '1rem' }}>
          <Button variant="danger" fullWidth icon={LogOut} onClick={logout} size="lg">
            Keluar / Sign Out
          </Button>
        </section>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '1.25rem',
            width: '100%', maxWidth: '500px', padding: '1.5rem',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Edit Profil</h3>
              <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: 'var(--color-text-secondary)' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>Nama Lengkap</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>Nomor HP</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="08123456789"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>Jenis Kendaraan</label>
                  <input
                    type="text"
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    placeholder="Mis. Motor Roda Tiga"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>Plat Nomor</label>
                  <input
                    type="text"
                    name="vehiclePlate"
                    value={formData.vehiclePlate}
                    onChange={handleChange}
                    placeholder="Mis. KT 1234 AB"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none', textTransform: 'uppercase' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>Zona Operasional</label>
                <input
                  type="text"
                  name="domicile"
                  value={formData.domicile}
                  onChange={handleChange}
                  placeholder="Mis. Balikpapan Barat"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', outline: 'none' }}
                />
              </div>
              
              <Button type="submit" fullWidth size="lg" disabled={loading} style={{ marginTop: '0.5rem', backgroundColor: 'var(--role-driver)' }}>
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .driver-profile-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 1.5rem;
          margin: 0 auto;
          width: 100%;
          max-width: 500px;
        }
        @media (min-width: 1024px) {
          .driver-profile-content {
            padding: 2rem 1.5rem;
            margin: -2rem auto 2rem;
            position: relative;
            z-index: 10;
          }
        }
      `}</style>
    </div>
  );
}
