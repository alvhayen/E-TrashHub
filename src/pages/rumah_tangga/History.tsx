import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { PackageX, Calendar, ChevronRight } from 'lucide-react';

export default function History() {
  const { request, loading } = useApi();
  const navigate = useNavigate();
  const [pickups, setPickups] = useState<any[]>([]);
  const [filter, setFilter] = useState<'semua' | 'proses' | 'selesai'>('semua');

  const fetchHistory = async () => {
    try {
      const data = await request('GET', '/api/pickup/household');
      setPickups(data.pickups || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [request]);

  const filteredPickups = pickups.filter(p => {
    if (filter === 'proses') return ['PENDING', 'ON_THE_WAY', 'COLLECTED'].includes(p.status);
    if (filter === 'selesai') return ['VERIFIED', 'COMPLETED'].includes(p.status);
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <header style={{ padding: '1.5rem', backgroundColor: '#fff', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '1rem' }}>Riwayat Jemputan</h1>
        
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', scrollbarWidth: 'none' }}>
          {['semua', 'proses', 'selesai'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'capitalize',
                border: filter === f ? 'transparent' : '1px solid var(--color-border)',
                backgroundColor: filter === f ? 'var(--color-primary)' : '#fff',
                color: filter === f ? '#fff' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
        {loading && pickups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Memuat riwayat...</div>
        ) : filteredPickups.length === 0 ? (
          <EmptyState 
            icon={PackageX} 
            title="Belum ada riwayat" 
            subtitle={filter === 'semua' ? 'Anda belum memesan penjemputan.' : `Tidak ada penjemputan dengan status ${filter}.`}
          />
        ) : (
          filteredPickups.map(pickup => (
            <Card 
              key={pickup.id} 
              variant="bordered" 
              padding="sm" 
              onClick={() => navigate(`/rumah_tangga/pickup/${pickup.id}`)}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  <Calendar size={14} />
                  {new Date(pickup.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <Badge status={pickup.status} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                    {pickup.wasteTypes.join(', ')}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                    Est: {pickup.estimatedWeight} kg {pickup.actualWeight && `• Aktual: ${pickup.actualWeight} kg`}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {pickup.points > 0 && <span style={{ fontWeight: 700, color: 'var(--color-tertiary)', fontSize: '0.875rem' }}>+{pickup.points} Pts</span>}
                  <ChevronRight size={20} color="var(--color-text-secondary)" />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
