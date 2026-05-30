import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { Landmark, Map } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

export default function PemdaDashboard() {
  const { request } = useApi();
  const [stats, setStats] = useState({ totalPemda: 0, totalRegions: 0 });

  useEffect(() => {
    request('GET', '/api/admin-pemda/stats').then(data => {
      setStats(data || { totalPemda: 0, totalRegions: 0 });
    }).catch(console.error);
  }, [request]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Ikhtisar Pemda</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Pantau entitas Pemerintah Daerah yang terdaftar dalam sistem.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <Card padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Total Entitas Pemda</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>{stats.totalPemda}</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#dcfce7', borderRadius: '50%', color: '#22c55e' }}>
              <Landmark size={24} />
            </div>
          </div>
        </Card>
        
        <Card padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Wilayah Cakupan</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>{stats.totalRegions}</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#e0f2fe', borderRadius: '50%', color: '#0ea5e9' }}>
              <Map size={24} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
