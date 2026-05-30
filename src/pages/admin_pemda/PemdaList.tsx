import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../components/ui/Toast';

export default function PemdaList() {
  const { request, loading } = useApi();
  const { success, error } = useToast();
  const [pemdas, setPemdas] = useState<any[]>([]);

  const fetchPemdas = () => {
    request('GET', '/api/admin-pemda/list').then(data => {
      setPemdas(data || []);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchPemdas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await request('PATCH', `/api/admin-pemda/${id}/status`, { status: newStatus });
      success('Status instansi Pemda berhasil diperbarui');
      fetchPemdas();
    } catch (err: any) {
      error(err.response?.data?.error || 'Gagal memperbarui status');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Manajemen Akun Pemda</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>Kelola dan awasi semua akun instansi Pemerintah Daerah yang memiliki akses ke dasbor data sampah.</p>
      </div>

      <Card padding="none">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Instansi / Nama PIC</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Wilayah Kerja</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Alamat Kantor</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Status Akun</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && pemdas.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Memuat data...</td>
                </tr>
              ) : pemdas.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Belum ada instansi pemda yang terdaftar.</td>
                </tr>
              ) : (
                pemdas.map(pemda => (
                  <tr key={pemda.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{pemda.name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{pemda.email}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{pemda.phone || '-'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Terdaftar sejak: {new Date(pemda.createdAt).toLocaleDateString('id-ID')}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ fontWeight: 600, color: '#3b82f6', backgroundColor: '#eff6ff', padding: '0.25rem 0.75rem', borderRadius: '1rem' }}>
                        {pemda.region || 'Belum diatur'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontSize: '0.875rem', maxWidth: '200px' }}>{pemda.officeAddress || '-'}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <Badge status={pemda.verificationStatus} />
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                      {pemda.verificationStatus === 'ACTIVE' ? (
                        <Button variant="danger" ghost size="sm" onClick={() => handleStatusChange(pemda.id, 'SUSPENDED')}>
                          Suspend
                        </Button>
                      ) : (
                        <Button variant="primary" ghost size="sm" onClick={() => handleStatusChange(pemda.id, 'ACTIVE')}>
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
