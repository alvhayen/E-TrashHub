import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { MapPin } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

export default function PemdaRegions() {
  const { request, loading } = useApi();
  const [regions, setRegions] = useState<any[]>([]);

  useEffect(() => {
    request('GET', '/api/admin-pemda/regions').then(data => {
      setRegions(data || []);
    }).catch(console.error);
  }, [request]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Distribusi Wilayah</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Melihat daftar wilayah (kota/kabupaten/provinsi) yang terhubung dengan akun Pemda.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ color: 'var(--color-text-secondary)' }}>Memuat data wilayah...</div>
        ) : regions.length === 0 ? (
          <div style={{ color: 'var(--color-text-secondary)' }}>Belum ada data wilayah yang terdaftar.</div>
        ) : (
          regions.map((region, index) => (
            <Card key={index} padding="lg" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', borderLeft: '4px solid #0ea5e9' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#e0f2fe', color: '#0ea5e9', borderRadius: '0.5rem' }}>
                <MapPin size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                  {region.name}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  Memiliki <strong>{region.pemdaCount}</strong> instansi terkait
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
