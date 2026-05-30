import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useApi } from '../../hooks/useApi';

export default function PemdaList() {
  const { request, loading } = useApi();
  const [pemdas, setPemdas] = useState<any[]>([]);

  useEffect(() => {
    request('GET', '/api/admin-pemda/list').then(data => {
      setPemdas(data || []);
    }).catch(console.error);
  }, [request]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Daftar Entitas Pemda</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Kelola semua akun Pemerintah Daerah yang terdaftar dalam sistem.</p>
      </div>

      <Card padding="none">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Instansi / Nama</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Wilayah</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Alamat Kantor</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Memuat data...</td>
                </tr>
              ) : pemdas.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Belum ada instansi pemda yang terdaftar.</td>
                </tr>
              ) : (
                pemdas.map(pemda => (
                  <tr key={pemda.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontWeight: 600 }}>{pemda.name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{pemda.email} | {pemda.phone}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ fontWeight: 600, color: '#3b82f6' }}>{pemda.region || '-'}</span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {pemda.officeAddress || '-'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <Badge status={pemda.verificationStatus} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
