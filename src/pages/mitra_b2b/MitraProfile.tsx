import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { useApi } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/form/Input';
import { LogOut, Building, Phone, Mail, Clock, ShieldCheck, MapPin, Edit2 } from 'lucide-react';

export default function MitraProfile() {
  const { user, logout, updateUser } = useAuth();
  const { success, error } = useToast();
  const { request, loading } = useApi();
  const [isEditing, setIsEditing] = useState(false);

  // states for editing
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '+62 811-2233-4455');
  const [address, setAddress] = useState(user?.address || 'Jl. Jend. Sudirman No. 45, Balikpapan');

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

  const mockHistory = [
    { id: 1, date: '2026-05-20', item: 'Botol Plastik PET Bersih', amount: '200 kg', status: 'Inquiry Sent', tps: 'TPS3R Balikpapan Barat' },
    { id: 2, date: '2026-05-15', item: 'Kertas Kardus Bekas', amount: '500 kg', status: 'Completed', tps: 'TPS3R Balikpapan Tengah' },
    { id: 3, date: '2026-05-10', item: 'Logam Kaleng Aluminium', amount: '150 kg', status: 'Completed', tps: 'TPS3R Balikpapan Timur' },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>Profil Manajemen Bisnis</h1>
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)} icon={Edit2}>Edit Profil</Button>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="ghost" onClick={() => {
              setIsEditing(false);
              setName(user?.name || '');
              setPhone(user?.phone || '+62 811-2233-4455');
              setAddress(user?.address || 'Jl. Jend. Sudirman No. 45, Balikpapan');
            }} disabled={loading}>Batal</Button>
            <Button onClick={handleSave} disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
          </div>
        )}
      </div>

      <Card variant="elevated" padding="xl" style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
        <div style={{ 
          width: '8rem', height: '8rem', borderRadius: '50%', 
          backgroundColor: '#153D32', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '3rem', fontWeight: 800,
          boxShadow: '0 10px 15px -3px rgba(21, 61, 50, 0.3)',
          flexShrink: 0
        }}>
          {name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Input label="Nama Perusahaan" value={name} onChange={e => setName(e.target.value)} icon={Building} />
              <Input label="Hotline Procurement" value={phone} onChange={e => setPhone(e.target.value)} icon={Phone} />
              <Input label="Alamat Kantor" value={address} onChange={e => setAddress(e.target.value)} icon={MapPin} />
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{name}</h2>
                <div style={{ backgroundColor: '#ecfdf5', color: '#10b981', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShieldCheck size={14} /> Verified Buyer
                </div>
              </div>
              <div style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem' }}>
                <Building size={20} /> Mitra B2B - Manufaktur Daur Ulang Pihak Ketiga
              </div>
              <div style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem' }}>
                <MapPin size={20} /> {address}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div>
                  <div style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem', fontSize: '0.875rem', textTransform: 'uppercase', fontWeight: 600 }}>Email Perusahaan</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, fontSize: '1.125rem' }}><Mail size={18} color="#153D32" /> {user?.email}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem', fontSize: '0.875rem', textTransform: 'uppercase', fontWeight: 600 }}>Hotline Procurement</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, fontSize: '1.125rem' }}><Phone size={18} color="#153D32" /> {phone}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      <Card variant="default" padding="lg">
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', color: '#0f172a' }}>Riwayat Inkuiri Akusisi (Mock)</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {mockHistory.map(h => (
            <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem', color: '#0f172a' }}>{h.item}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, color: '#153D32' }}>Volume: {h.amount}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> {h.tps}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {h.date}</div>
                </div>
              </div>
              <div style={{ 
                fontSize: '0.875rem', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '9999px',
                backgroundColor: h.status === 'Completed' ? '#ecfdf5' : '#f0f9ff',
                color: h.status === 'Completed' ? '#10b981' : '#0284c7',
                border: `1px solid ${h.status === 'Completed' ? '#10b981' : '#0284c7'}30`
              }}>
                {h.status}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
        <Button variant="danger" ghost icon={LogOut} onClick={logout} size="lg" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
          Sign Out / Akhiri Sesi
        </Button>
      </div>
    </div>
  );
}
