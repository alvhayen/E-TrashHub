import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LineChart from '../../components/chart/LineChart';
import { MapPin, Package, MessageCircle, ArrowLeft, Building2, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';

export default function MaterialDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { request } = useApi();
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    request('GET', `/api/inventory/admin`).then(data => {
      // Mocking fetch all using admin endpoint for the sake of presentation
      const found = data.inventory?.find((i: any) => i.id === parseInt(id || '0'));
      if (found) setItem(found);
    }).catch(console.error);
  }, [id, request]);

  if (!item) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '1.25rem' }}>Memuat spesifikasi material...</div>;

  const stockStatus = item.stockKg > 100 ? 'high' : item.stockKg > 50 ? 'medium' : 'low';
  const statusColor = stockStatus === 'high' ? '#10b981' : stockStatus === 'medium' ? '#f59e0b' : '#ef4444';

  const chartData = {
    labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
    data: [item.stockKg * 0.7, item.stockKg * 0.85, item.stockKg * 0.95, item.stockKg] // Mock historical data
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <button 
        onClick={() => navigate(-1)}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          color: '#153D32', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          cursor: 'pointer',
          fontWeight: 600,
          width: 'fit-content',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'rgba(21, 61, 50, 0.05)',
          transition: 'background-color 0.2s'
        }}
      >
        <ArrowLeft size={18} /> Kembali ke Katalog
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Main Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <Card variant="default" padding="xl">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ 
                width: '5rem', height: '5rem', borderRadius: 'var(--radius-lg)', 
                backgroundColor: '#ecfdf5', color: '#153D32',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Package size={40} />
              </div>
              <Badge status={item.status} />
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: '#0f172a' }}>{item.commodity}</h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--color-text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6, maxWidth: '800px' }}>
              Material daur ulang ini telah disortir, dibersihkan, dan di-press di {`TPS3R Surabaya Barat`}. Kondisi material standar industri dan siap dikirim ke pabrik pengolahan lanjutan.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '2rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-xl)', marginBottom: '3rem', border: '1px solid var(--color-border)' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.5rem' }}>Harga Penawaran / kg</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#153D32' }}>Rp {item.pricePerKg.toLocaleString()}</div>
              </div>
              <div style={{ width: '1px', backgroundColor: 'var(--color-border)' }} />
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.5rem' }}>Total Stok Tersedia</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {item.stockKg} kg 
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 600, color: statusColor, backgroundColor: `${statusColor}15`, padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusColor }} />
                    Volume Aman
                  </div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '2.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} color="#153D32" /> Trend Volume Stok (4 Minggu Terakhir)
              </h3>
              <div style={{ height: '350px', backgroundColor: '#fff', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
                <LineChart data={chartData.data} labels={chartData.labels} color="#153D32" />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Action & Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '100px' }}>
          <Card variant="elevated" padding="lg">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#153D32' }}>
              <Building2 size={24} /> Profil Vendor TPS3R
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.875rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>TPS3R Surabaya Barat</div>
                <div style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', lineHeight: 1.4 }}>
                  <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px' }} /> 
                  Jl. Raya Lontar No. 123, Sambikerep, Surabaya Barat, Jawa Timur 60216
                </div>
              </div>
              
              <div>
                <div style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>Informasi Kontak Representatif</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500, padding: '0.5rem 0' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: '#f1f5f9', borderRadius: '50%' }}><Phone size={14} color="#153D32" /></div>
                  +62 812-3456-7890 (Bpk. Budi - Pengelola)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500, padding: '0.5rem 0' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: '#f1f5f9', borderRadius: '50%' }}><Mail size={14} color="#153D32" /></div>
                  admin@tps3r-barat.id
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)' }}>
                  <CheckCircle2 size={16} color="#10b981" /> Terverifikasi oleh Pemda
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)' }}>
                  <CheckCircle2 size={16} color="#10b981" /> Kapasitas Timbang Akurat
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <Button 
                fullWidth 
                icon={MessageCircle} 
                size="lg"
                style={{ backgroundColor: '#25D366', color: '#fff', fontSize: '1.125rem', padding: '1rem' }}
                onClick={() => {
                  const text = encodeURIComponent(`Halo TPS3R Surabaya Barat,\n\nSaya tertarik untuk mengakuisisi komoditas:\n*${item.commodity}*\nStok: ${item.stockKg} kg\nHarga: Rp ${item.pricePerKg}/kg\n\nApakah material ini siap di-survey dan dijemput?`);
                  window.open(`https://wa.me/628123456789?text=${text}`, '_blank');
                }}
              >
                Inkuiri via WhatsApp
              </Button>
              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '1rem', lineHeight: 1.4 }}>
                Sistem e-procurement kami memfasilitasi penemuan. Transaksi akhir diselesaikan langsung antara mitra B2B dan TPS3R.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
