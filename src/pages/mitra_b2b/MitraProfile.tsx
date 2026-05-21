import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { LogOut, Building, Phone, Mail, Clock, ShieldCheck, MapPin } from 'lucide-react';

export default function MitraProfile() {
  const { user, logout } = useAuth();

  const mockHistory = [
    { id: 1, date: '2026-05-20', item: 'Botol Plastik PET Bersih', amount: '200 kg', status: 'Inquiry Sent', tps: 'TPS3R Surabaya Barat' },
    { id: 2, date: '2026-05-15', item: 'Kertas Kardus Bekas', amount: '500 kg', status: 'Completed', tps: 'TPS3R Mulyorejo' },
    { id: 3, date: '2026-05-10', item: 'Logam Kaleng Aluminium', amount: '150 kg', status: 'Completed', tps: 'TPS3R Rungkut' },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a' }}>Profil Manajemen Bisnis</h1>

      <Card variant="elevated" padding="xl" style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
        <div style={{ 
          width: '8rem', height: '8rem', borderRadius: '50%', 
          backgroundColor: '#153D32', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '3rem', fontWeight: 800,
          boxShadow: '0 10px 15px -3px rgba(21, 61, 50, 0.3)'
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{user?.name}</h2>
            <div style={{ backgroundColor: '#ecfdf5', color: '#10b981', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ShieldCheck size={14} /> Verified Buyer
            </div>
          </div>
          <div style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem' }}>
            <Building size={20} /> Mitra B2B - Manufaktur Daur Ulang Pihak Ketiga
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div>
              <div style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem', fontSize: '0.875rem', textTransform: 'uppercase', fontWeight: 600 }}>Email Perusahaan</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, fontSize: '1.125rem' }}><Mail size={18} color="#153D32" /> {user?.email}</div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem', fontSize: '0.875rem', textTransform: 'uppercase', fontWeight: 600 }}>Hotline Procurement</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, fontSize: '1.125rem' }}><Phone size={18} color="#153D32" /> +62 811-2233-4455</div>
            </div>
          </div>
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
