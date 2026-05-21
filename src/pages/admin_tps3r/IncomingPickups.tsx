import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/form/Input';

export default function IncomingPickups() {
  const { request, loading } = useApi();
  const navigate = useNavigate();
  const [pickups, setPickups] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    request('GET', '/api/pickup/admin').then(data => {
      setPickups(data.pickups || []);
    }).catch(console.error);
  }, [request]);

  const filtered = pickups.filter(p => p.status === 'COLLECTED' && (p.user?.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <PageContainer title="Jemputan Masuk (Menunggu Timbang)" subtitle="Daftar sampah yang telah diantar oleh driver armada">
      <Card variant="default">
        <div style={{ marginBottom: '1rem', maxWidth: '300px' }}>
          <Input placeholder="Cari nama nasabah..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                <th style={{ padding: '0.75rem' }}>No.</th>
                <th style={{ padding: '0.75rem' }}>Tanggal</th>
                <th style={{ padding: '0.75rem' }}>Nama Nasabah</th>
                <th style={{ padding: '0.75rem' }}>Jenis Barang</th>
                <th style={{ padding: '0.75rem' }}>Est. Berat</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem 0.75rem' }}>{idx + 1}</td>
                  <td style={{ padding: '1rem 0.75rem' }}>{new Date(p.updatedAt || p.createdAt).toLocaleDateString('id-ID')}</td>
                  <td style={{ padding: '1rem 0.75rem', fontWeight: 600 }}>{p.user?.name}</td>
                  <td style={{ padding: '1rem 0.75rem' }}>{p.wasteTypes.join(', ')}</td>
                  <td style={{ padding: '1rem 0.75rem' }}>{p.estimatedWeight} kg</td>
                  <td style={{ padding: '1rem 0.75rem', textAlign: 'right' }}>
                    <Button size="sm" onClick={() => navigate(`/admin_tps3r/weigh/${p.id}`)} style={{ backgroundColor: 'var(--role-admin)' }}>
                      Timbang →
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>Tidak ada jemputan masuk yang menunggu.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
}
