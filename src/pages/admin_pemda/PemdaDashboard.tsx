import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { Landmark, Map, ArrowRight } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { Link } from 'react-router-dom';

export default function PemdaDashboard() {
  const { request, loading } = useApi();
  const [stats, setStats] = useState({ totalPemda: 0, totalRegions: 0 });

  useEffect(() => {
    request('GET', '/api/admin-pemda/stats').then(data => {
      setStats(data || { totalPemda: 0, totalRegions: 0 });
    }).catch(console.error);
  }, [request]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Ikhtisar Admin Pemda</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Pantau dan kelola entitas Pemerintah Daerah (Pemda) yang menggunakan layanan e-TrashHub.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <Card padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Total Entitas Pemda</div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
                {loading ? '-' : stats.totalPemda}
              </div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#dcfce7', borderRadius: '50%', color: '#22c55e' }}>
              <Landmark size={32} />
            </div>
          </div>
          <Link to="/admin-pemda/list" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#22c55e', textDecoration: 'none' }}>
            Kelola Akun Pemda <ArrowRight size={16} />
          </Link>
        </Card>
        
        <Card padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Wilayah Cakupan (Region)</div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
                {loading ? '-' : stats.totalRegions}
              </div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#e0f2fe', borderRadius: '50%', color: '#0ea5e9' }}>
              <Map size={32} />
            </div>
          </div>
          <Link to="/admin-pemda/regions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#0ea5e9', textDecoration: 'none' }}>
            Lihat Distribusi Wilayah <ArrowRight size={16} />
          </Link>
        </Card>
      </div>
    </div>
  );
}
