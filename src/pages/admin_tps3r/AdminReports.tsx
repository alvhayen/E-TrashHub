import React, { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import PageContainer from '../../components/layout/PageContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import BarChart from '../../components/chart/BarChart';
import { Printer } from 'lucide-react';

export default function AdminReports() {
  const { request } = useApi();
  const [pickups, setPickups] = useState<any[]>([]);

  useEffect(() => {
    request('GET', '/api/pickup/admin').then(data => {
      setPickups((data.pickups || []).filter((p:any) => p.status === 'COMPLETED'));
    });
  }, [request]);

  const totalKg = pickups.reduce((sum, p) => sum + (p.actualWeight || 0), 0);
  const totalPoints = pickups.reduce((sum, p) => sum + (p.points || 0), 0);
  
  const chartData = {
    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
    data: [15, 20, 18, 28, 25, 40, 12] // Mocked for visual
  };

  return (
    <PageContainer 
      title="Laporan TPS3R" 
      subtitle="Analisis perolehan harian dan data log"
      actions={<Button variant="secondary" icon={Printer} onClick={() => window.print()}>Cetak / Export</Button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '2rem' }} className="print-grid">
        <Card variant="bordered">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Volume Sampah 7 Hari Terakhir (kg)</h3>
          <BarChart data={chartData.data} labels={chartData.labels} colors="var(--role-admin)" />
        </Card>
        
        <Card variant="default" style={{ backgroundColor: '#fff8f1' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Akumulasi Periode Ini</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Volume Riil</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{totalKg.toFixed(1)} kg</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Titik Selesai</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{pickups.length}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Poin Disalurkan</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-tertiary)' }}>{totalPoints.toLocaleString()} <span style={{ fontSize: '1rem' }}>Pts</span></div>
            </div>
          </div>
        </Card>
      </div>

      <Card variant="default">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Data Transaksi Masuk Terakhir</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              <th style={{ padding: '0.75rem' }}>Tanggal Verifikasi</th>
              <th style={{ padding: '0.75rem' }}>Nama Nasabah</th>
              <th style={{ padding: '0.75rem' }}>Sampah Masuk</th>
              <th style={{ padding: '0.75rem' }}>Timbangan (kg)</th>
              <th style={{ padding: '0.75rem' }}>Poin Cair</th>
            </tr>
          </thead>
          <tbody>
            {pickups.slice(0, 15).map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '1rem 0.75rem' }}>{new Date(p.updatedAt).toLocaleString('id-ID')}</td>
                <td style={{ padding: '1rem 0.75rem', fontWeight: 600 }}>{p.user?.name}</td>
                <td style={{ padding: '1rem 0.75rem' }}>{p.wasteTypes.join(', ')}</td>
                <td style={{ padding: '1rem 0.75rem', fontWeight: 600 }}>{p.actualWeight}</td>
                <td style={{ padding: '1rem 0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>+{p.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <style>{`
        @media print {
          .print-grid { display: block !important; }
        }
      `}</style>
    </PageContainer>
  );
}
