import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { Users, Truck, Activity, ArrowRight } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { Link } from 'react-router-dom';

export default function DriverDashboard() {
  const { request, loading } = useApi();
  const [stats, setStats] = useState({ totalDrivers: 0, activeDrivers: 0, pickupsToday: 0 });

  useEffect(() => {
    request('GET', '/api/admin-driver/stats').then(data => {
      setStats(data || { totalDrivers: 0, activeDrivers: 0, pickupsToday: 0 });
    }).catch(console.error);
  }, [request]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Ikhtisar Armada Driver</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Pantau ketersediaan, performa, dan aktivitas driver secara keseluruhan.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <Card padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Total Driver Terdaftar</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
                {loading ? '-' : stats.totalDrivers}
              </div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '50%', color: '#3b82f6' }}>
              <Users size={24} />
            </div>
          </div>
          <Link to="/admin-driver/list" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#3b82f6', textDecoration: 'none' }}>
            Kelola Driver <ArrowRight size={16} />
          </Link>
        </Card>
        
        <Card padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Driver Sedang Aktif</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
                {loading ? '-' : stats.activeDrivers}
              </div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#ecfccb', borderRadius: '50%', color: '#65a30d' }}>
              <Activity size={24} />
            </div>
          </div>
          <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Driver yang sedang online / bertugas
          </div>
        </Card>

        <Card padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Total Pickup Hari Ini</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.5rem' }}>
                {loading ? '-' : stats.pickupsToday}
              </div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '50%', color: '#d97706' }}>
              <Truck size={24} />
            </div>
          </div>
          <Link to="/admin-driver/activity" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#d97706', textDecoration: 'none' }}>
            Lihat Aktivitas <ArrowRight size={16} />
          </Link>
        </Card>
      </div>
    </div>
  );
}
