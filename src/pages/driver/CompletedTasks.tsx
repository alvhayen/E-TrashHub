import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useApi } from '../../hooks/useApi';
import { CheckCircle2, Clock } from 'lucide-react';

export default function CompletedTasks() {
  const { request, loading } = useApi();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    request('GET', '/api/pickup/driver').then(data => {
      setTasks((data.pickups || []).filter((p: any) => p.status === 'COLLECTED' || p.status === 'VERIFIED' || p.status === 'COMPLETED'));
    }).catch(console.error);
  }, [request]);

  const totalKg = tasks.reduce((sum, t) => sum + (t.actualWeight || t.estimatedWeight || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <header style={{ padding: '1.5rem', backgroundColor: '#fff', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Tugas Selesai</h1>
      </header>

      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
        <Card variant="default" style={{ backgroundColor: 'var(--role-driver)', color: '#fff', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Terkumpul Hari Ini</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalKg.toFixed(1)} kg</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Titik Selesai</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{tasks.length}</div>
            </div>
          </div>
        </Card>

        {loading ? (
           <div style={{ textAlign: 'center', padding: '2rem' }}>Memuat...</div>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>Belum ada tugas yang selesai.</div>
        ) : (
          tasks.map(task => (
            <Card key={task.id} variant="bordered" padding="sm">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{task.user?.name}</div>
                <Badge status={task.status} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={14} /> 
                  {new Date(task.updatedAt || task.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ fontWeight: 600 }}>Est: {task.estimatedWeight} kg</div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
