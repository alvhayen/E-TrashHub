import React, { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import PageContainer from '../../components/layout/PageContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Package, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export default function CustomerOrders() {
  const { request, loading } = useApi();
  const { success, error: toastError } = useToast();
  const [orders, setOrders] = useState<any[]>([]);

  const fetchOrders = () => {
    request('GET', '/api/orders/customer').then(data => {
      setOrders(data.orders || []);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleComplete = async (id: number) => {
    try {
      await request('PATCH', `/api/orders/${id}/complete`, {});
      success('Pesanan berhasil diselesaikan');
      fetchOrders();
    } catch (error: any) {
      toastError(error.message || 'Gagal');
    }
  };

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'PENDING': return <Badge status="pending" label="Menunggu Konfirmasi" />;
      case 'CONFIRMED': return <Badge status="verified" label="Disetujui" />;
      case 'DRIVER_ASSIGNED': return <Badge status="processing" label="Menunggu Pengiriman" />;
      case 'ON_THE_WAY': return <Badge status="on_the_way" pulse label="Dalam Perjalanan" />;
      case 'DELIVERED': return <Badge status="ready" pulse label="Tiba di Lokasi" />;
      case 'COMPLETED': return <Badge status="completed" label="Selesai" />;
      case 'REJECTED': return <Badge status="sold_out" label="Ditolak" />;
      default: return <Badge status="pending" label={status} />;
    }
  };

  return (
    <PageContainer title="Pesanan Saya" subtitle="Lacak status pesanan material limbah anorganik dari TPS3R">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {loading && orders.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Memuat data pesanan...</div>
        ) : orders.length === 0 ? (
          <Card padding="xl" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            Belum ada pesanan material yang dibuat.
          </Card>
        ) : (
          orders.map(order => (
            <Card key={order.id} padding="lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Order #{order.id.toString().padStart(4, '0')}</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                    {new Date(order.createdAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                {getStatusDisplay(order.status)}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Komoditas</div>
                  <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{order.inventory?.commodity}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Volume</div>
                  <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{order.quantityKg} Kg</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total Harga</div>
                  <div style={{ fontWeight: 600, marginTop: '0.25rem', color: '#153D32' }}>Rp {order.totalPrice.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Supplier</div>
                  <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{order.tps3r?.tpsName || order.tps3r?.name}</div>
                </div>
              </div>

              {order.status === 'REJECTED' && order.rejectionReason && (
                <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                  <strong>Alasan Penolakan:</strong> {order.rejectionReason}
                </div>
              )}

              {order.status === 'DELIVERED' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                  <Button 
                    style={{ backgroundColor: '#10b981', color: '#fff' }}
                    onClick={() => handleComplete(order.id)}
                  >
                    Konfirmasi Material Diterima
                  </Button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </PageContainer>
  );
}
