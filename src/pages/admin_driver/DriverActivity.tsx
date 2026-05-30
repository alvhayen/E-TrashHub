import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useApi } from '../../hooks/useApi';
import { Clock, MapPin, Truck } from 'lucide-react';

function getRelativeTime(dateString: string) {
  const rtf = new Intl.RelativeTimeFormat('id', { numeric: 'auto' });
  const time = new Date(dateString).getTime();
  const now = Date.now();
  const diffInSeconds = Math.round((time - now) / 1000);

  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(diffInSeconds, 'second');
  }
  const diffInMinutes = Math.round(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) {
    return rtf.format(diffInMinutes, 'minute');
  }
  const diffInHours = Math.round(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    return rtf.format(diffInHours, 'hour');
  }
  const diffInDays = Math.round(diffInHours / 24);
  return rtf.format(diffInDays, 'day');
}

export default function DriverActivity() {
  const { request, loading } = useApi();
  const [activities, setActivities] = useState<any[]>([]);

  const fetchActivity = () => {
    request('GET', '/api/admin-driver/activity').then(data => {
      setActivities(data.activePickups || []);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 30000); // refresh every 30s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Aktivitas Driver (Live)</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>Memantau tugas penjemputan yang sedang dikerjakan secara real-time.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', animation: 'pulse 2s infinite' }} />
          Auto-refresh aktif
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading && activities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
            Memuat data aktivitas...
          </div>
        ) : activities.length === 0 ? (
          <Card padding="xl" style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '50%', color: '#94a3b8', marginBottom: '1rem' }}>
              <Clock size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Tidak Ada Aktivitas Berjalan</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>Saat ini tidak ada driver yang sedang mengerjakan tugas penjemputan.</p>
          </Card>
        ) : (
          activities.map(task => (
            <Card key={task.id} padding="md" style={{ borderLeft: '4px solid var(--role-driver)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: '#e0f2fe', color: 'var(--role-driver)', borderRadius: '0.5rem' }}>
                    <Truck size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>
                      {task.driver?.name || 'Driver Tidak Diketahui'}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>Plat: {task.driver?.vehiclePlate || '-'}</span>
                      <span>•</span>
                      <span style={{ color: task.driver?.isOnDuty ? '#059669' : '#dc2626', fontWeight: 600 }}>
                        {task.driver?.isOnDuty ? 'Sedang Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge status={task.status} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>Pelanggan</div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{task.user?.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{task.user?.phone || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>Lokasi Penjemputan</div>
                  <div style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'flex-start', gap: '0.25rem' }}>
                    <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-text-secondary)' }} />
                    <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{task.address}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>Pembaruan Terakhir</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                    {getRelativeTime(task.updatedAt)}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .5; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
