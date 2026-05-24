import React, { useState, useEffect } from 'react';
import { Users, Building2, Landmark, Clock, Activity } from 'lucide-react';
import Card from '../../components/ui/Card';

export default function SuperAdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingVerification: 0,
    activeTps3r: 0,
    activePemda: 0
  });

  useEffect(() => {
    // Simulated fetch
    setTimeout(() => {
      setStats({
        totalUsers: 1240,
        pendingVerification: 15,
        activeTps3r: 45,
        activePemda: 12
      });
    }, 500);
  }, []);

  const activities = [
    { id: 1, action: 'APPROVED', target: 'TPS3R Melati - Jakarta Selatan', date: '10 menit yang lalu' },
    { id: 2, action: 'REJECTED', target: 'Dinas Lingkungan Hidup Kab. X', date: '1 jam yang lalu' },
    { id: 3, action: 'APPROVED', target: 'TPS3R Berkah Alam - Depok', date: '3 jam yang lalu' },
    { id: 4, action: 'APPROVED', target: 'TPS3R Sukamaju - Tangerang', date: 'Kemarin' },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 32px' }}>
        Overview
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <Card style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Total Pengguna</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{stats.totalUsers}</div>
          </div>
        </Card>

        <Card style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Menunggu Verifikasi</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{stats.pendingVerification}</div>
          </div>
        </Card>

        <Card style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>TPS3R Aktif</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{stats.activeTps3r}</div>
          </div>
        </Card>

        <Card style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f3e8ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Landmark size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Pemda Aktif</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{stats.activePemda}</div>
          </div>
        </Card>
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Activity size={20} color="#3b82f6" /> Aktivitas Terbaru
      </h2>

      <Card style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activities.map((act) => (
            <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: act.action === 'APPROVED' ? '#dcfce7' : '#fee2e2', color: act.action === 'APPROVED' ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800, fontSize: '0.85rem' }}>
                {act.action === 'APPROVED' ? '✓' : '✗'}
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', color: '#1e293b', marginBottom: '4px' }}>
                  Super Admin <span style={{ fontWeight: 700, color: act.action === 'APPROVED' ? '#16a34a' : '#dc2626' }}>{act.action === 'APPROVED' ? 'menyetujui' : 'menolak'}</span> verifikasi <strong>{act.target}</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{act.date}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
