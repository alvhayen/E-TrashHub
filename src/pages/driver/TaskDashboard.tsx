import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { MapPin, Navigation } from 'lucide-react';

export default function TaskDashboard() {
  const { user } = useAuth();
  const { request, loading } = useApi();
  const { success, error } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);

  const fetchPickups = async () => {
    try {
      const data = await request('GET', '/api/pickup/driver');
      setTasks(data.pickups || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, [request]);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    
    try {
      await request('PATCH', `/api/pickup/${id}/status`, { status: newStatus });
      success('Status berhasil diperbarui!');
    } catch (err: any) {
      error(err.response?.data?.error || 'Gagal memperbarui status');
      // Revert on failure
      fetchPickups();
    }
  };

  const activeTasks = tasks.filter(t => ['PENDING', 'ON_THE_WAY', 'COLLECTED'].includes(t.status));
  const completedCount = tasks.filter(t => t.status === 'COLLECTED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <header style={{ padding: '1.5rem', backgroundColor: 'var(--role-driver)', color: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Tugas Hari Ini</h1>
        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
          Zona: Surabaya Barat • {tasks.length} titik hari ini
        </div>
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
            <span>Progres Selesai</span>
            <span>{completedCount}/{tasks.length} selesai</span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%`, height: '100%', backgroundColor: '#fff', borderRadius: '3px', transition: 'width 0.3s' }} />
          </div>
        </div>
      </header>

      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
        {loading && tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>Memuat tugas...</div>
        ) : activeTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Semua Tugas Selesai!</h3>
            <p>Tidak ada titik penjemputan aktif saat ini.</p>
          </div>
        ) : (
          activeTasks.map((task, index) => (
            <Card key={task.id} variant="elevated" padding="md" style={{ borderLeft: `6px solid var(--role-driver)` }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ 
                  width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: 'var(--role-driver)', color: '#fff', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{task.user?.name || 'Rumah Tangga'}</h3>
                    <Badge status={task.status} pulse={task.status === 'ON_THE_WAY'} />
                  </div>
                  
                  <div 
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem', cursor: 'pointer' }}
                    onClick={() => window.open(`https://maps.google.com/?q=${task.address}`, '_blank')}
                  >
                    <MapPin size={16} color="var(--color-text-secondary)" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500, lineHeight: 1.4, textDecoration: 'underline' }}>
                      {task.address}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {task.wasteTypes.map((type: string) => (
                      <span key={type} style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.125rem 0.5rem', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: 'var(--radius-sm)' }}>
                        {type}
                      </span>
                    ))}
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.125rem 0.5rem', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: 'var(--radius-sm)' }}>
                      Est: {task.estimatedWeight} kg
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-tertiary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Navigation size={14} /> Terjadwal: 08:00 - 10:00
                  </div>

                  {task.status === 'PENDING' && (
                    <Button fullWidth size="lg" onClick={() => handleUpdateStatus(task.id, 'ON_THE_WAY')} style={{ backgroundColor: 'var(--role-driver)', fontSize: '1rem' }}>
                      🔵 Jemput Sekarang
                    </Button>
                  )}
                  {task.status === 'ON_THE_WAY' && (
                    <Button fullWidth size="lg" onClick={() => handleUpdateStatus(task.id, 'COLLECTED')} style={{ backgroundColor: 'var(--color-primary)', fontSize: '1rem' }}>
                      ✅ Sampah Diambil
                    </Button>
                  )}
                  {task.status === 'COLLECTED' && (
                    <Button fullWidth size="lg" disabled style={{ backgroundColor: '#f59e0b', fontSize: '1rem' }}>
                      🏭 Menuju TPS3R →
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
