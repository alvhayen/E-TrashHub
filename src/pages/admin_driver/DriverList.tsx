import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useApi } from '../../hooks/useApi';

export default function DriverList() {
  const { request, loading } = useApi();
  const [drivers, setDrivers] = useState<any[]>([]);

  useEffect(() => {
    request('GET', '/api/admin-driver/list').then(data => {
      setDrivers(data || []);
    }).catch(console.error);
  }, [request]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Daftar Driver</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Kelola semua driver dan pengepul yang terdaftar dalam sistem.</p>
      </div>

      <Card padding="none">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Nama Driver</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Tipe</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Lokasi / Domisili</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Memuat data...</td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Belum ada driver yang terdaftar.</td>
                </tr>
              ) : (
                drivers.map(driver => (
                  <tr key={driver.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontWeight: 600 }}>{driver.name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{driver.email} | {driver.phone}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {driver.driverType === 'FREELANCE' ? 'Freelance' : 'Mitra TPS3R'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {driver.domicile || '-'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <Badge status={driver.verificationStatus} />
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
