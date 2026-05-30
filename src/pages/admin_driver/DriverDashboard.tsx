import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { Users, CheckCircle, Clock } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

export default function DriverDashboard() {
  const { request } = useApi();
  const [stats, setStats] = useState({ totalDrivers: 0, activeToday: 0 });

  useEffect(() => {
    request('GET', '/api/admin-driver/stats').then(data => {
      setStats(data || { totalDrivers: 0, activeToday: 0 });
    }).catch(console.error);
  }, [request]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Ikhtisar Driver</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Pantau performa dan ketersediaan driver secara real-time.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <Card padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Total Driver Terdaftar</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>{stats.totalDrivers}</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#fffbeb', borderRadius: '50%', color: '#f59e0b' }}>
              <Users size={24} />
            </div>
          </div>
        </Card>
        
        <Card padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Aktif Hari Ini</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>{stats.activeToday}</div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#ecfccb', borderRadius: '50%', color: '#65a30d' }}>
              <CheckCircle size={24} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
