import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import PageContainer from '../../components/layout/PageContainer';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import { Inbox, Scale, Package, Gift, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const { request } = useApi();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ incoming: 0, totalKg: 0, activeInventory: 0, points: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      request('GET', '/api/pickup/admin'),
      request('GET', '/api/inventory/admin')
    ]).then(([pickupData, invData]) => {
      const pickups = pickupData.pickups || [];
      const inventory = invData.inventory || [];
      
      const incoming = pickups.filter((p: any) => p.status === 'COLLECTED').length;
      const completed = pickups.filter((p: any) => p.status === 'COMPLETED');
      const totalKg = completed.reduce((sum, p) => sum + (p.actualWeight || 0), 0);
      const points = completed.reduce((sum, p) => sum + (p.points || 0), 0);
      
      setStats({ incoming, totalKg, activeInventory: inventory.length, points });
      setRecent(completed.slice(0, 5));
    }).catch(console.error);
  }, [request]);

  return (
    <PageContainer title="Dashboard TPS3R" subtitle="Ringkasan aktivitas dan operasional harian">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard label="Tunggu Timbang" value={stats.incoming} icon={Inbox} color="var(--role-admin)" />
        <StatCard label="Total Dikelola" value={stats.totalKg} suffix=" kg" icon={Scale} color="var(--role-admin)" />
        <StatCard label="Inventori Aktif" value={stats.activeInventory} icon={Package} color="var(--role-admin)" />
        <StatCard label="Poin Disalurkan" value={stats.points} icon={Gift} color="var(--role-admin)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
        <Card variant="default">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Verifikasi Terakhir</h2>
          {recent.length === 0 ? <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Belum ada aktivitas.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recent.map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.user?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{new Date(r.updatedAt || r.createdAt).toLocaleString('id-ID')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--role-admin)' }}>{r.actualWeight} kg</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-tertiary)' }}>+{r.points} Pts</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card variant="default" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Akses Cepat</h2>
          <button 
            onClick={() => navigate('/admin_tps3r/incoming')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: '#d97706', fontWeight: 600 }}
          >
            Timbang Jemputan Masuk <ArrowRight size={20} />
          </button>
          <button 
            onClick={() => navigate('/admin_tps3r/inventory')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: '#047857', fontWeight: 600 }}
          >
            Kelola Inventori <ArrowRight size={20} />
          </button>
        </Card>
      </div>
    </PageContainer>
  );
}
