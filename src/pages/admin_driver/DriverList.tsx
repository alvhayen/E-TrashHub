import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../components/ui/Toast';

export default function DriverList() {
  const { request, loading } = useApi();
  const { success, error } = useToast();
  const [drivers, setDrivers] = useState<any[]>([]);

  const fetchDrivers = () => {
    request('GET', '/api/admin-driver/list').then(data => {
      setDrivers(data || []);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await request('PATCH', `/api/admin-driver/${id}/status`, { status: newStatus });
      success('Status driver berhasil diperbarui');
      fetchDrivers();
    } catch (err: any) {
      error(err.response?.data?.error || 'Gagal memperbarui status');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Manajemen Driver</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Kelola semua driver dan mitra TPS3R yang terdaftar dalam sistem e-TrashHub.</p>
      </div>

      <Card padding="none">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Info Driver</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Kendaraan & Zona</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Performa</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Status Akun</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && drivers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Memuat data...</td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Belum ada driver yang terdaftar.</td>
                </tr>
              ) : (
                drivers.map(driver => (
                  <tr key={driver.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{driver.name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{driver.email}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{driver.phone || '-'}</div>
                      <div style={{ marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '1rem', backgroundColor: '#e2e8f0', fontWeight: 600 }}>
                          {driver.driverType === 'FREELANCE' ? 'Freelance' : 'Mitra TPS3R'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{driver.vehicleType || '-'}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Plat: {driver.vehiclePlate || '-'}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Zona: {driver.domicile || '-'}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: driver.isOnDuty ? '#22c55e' : '#94a3b8' }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{driver.isOnDuty ? 'Sedang Aktif' : 'Offline'}</span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                        Diselesaikan: <strong>{driver._count?.pickupRequestsAsDriver || 0}</strong> tugas
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <Badge status={driver.verificationStatus} />
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                      {driver.verificationStatus === 'ACTIVE' ? (
                        <Button variant="danger" ghost size="sm" onClick={() => handleStatusChange(driver.id, 'SUSPENDED')}>
                          Suspend
                        </Button>
                      ) : (
                        <Button variant="primary" ghost size="sm" onClick={() => handleStatusChange(driver.id, 'ACTIVE')}>
                          Aktifkan
                        </Button>
                      )}
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
