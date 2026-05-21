import React from 'react';
import Card from '../../components/ui/Card';
import { AlertCircle, ShieldCheck, CheckCircle2, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CompliancePage() {
  const trendData = [
    { month: 'Jan', compliance: 65 },
    { month: 'Feb', compliance: 68 },
    { month: 'Mar', compliance: 75 },
    { month: 'Apr', compliance: 82 },
    { month: 'Mei', compliance: 85 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Kepatuhan Pemilahan</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.125rem' }}>Indeks kepatuhan pemilahan sampah dari sumber (Rumah Tangga)</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card variant="bordered" padding="xl">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck color="#059669" /> Trend Kepatuhan Agregat Kota
            </h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                  <Line type="monotone" dataKey="compliance" name="Kepatuhan (%)" stroke="#059669" strokeWidth={4} dot={{r: 6}} activeDot={{r: 8}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card variant="default">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c' }}>
              <AlertCircle size={20} /> Zona Perhatian Khusus (&lt; 60% Kepatuhan)
            </h3>
            <div style={{ padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '1.125rem' }}>Kecamatan Semampir</div>
                <div style={{ fontSize: '0.875rem', color: '#b91c1c' }}>Rata-rata Kepatuhan: 52% (Turun 3%)</div>
              </div>
              <div style={{ padding: '0.5rem 1rem', backgroundColor: '#fff', color: '#b91c1c', fontWeight: 700, borderRadius: 'var(--radius-full)', border: '1px solid #fecaca' }}>
                Intervensi Diperlukan
              </div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#991b1b', fontSize: '1.125rem' }}>Kecamatan Pabean Cantikan</div>
                <div style={{ fontSize: '0.875rem', color: '#b91c1c' }}>Rata-rata Kepatuhan: 58%</div>
              </div>
              <div style={{ padding: '0.5rem 1rem', backgroundColor: '#fff', color: '#b91c1c', fontWeight: 700, borderRadius: 'var(--radius-full)', border: '1px solid #fecaca' }}>
                Pantau Intensif
              </div>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card variant="elevated" padding="lg" style={{ backgroundColor: '#059669', color: '#fff' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Rekomendasi Tindakan</h3>
            <p style={{ opacity: 0.9, fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Berdasarkan AI analytics terhadap pola pemilahan bulan ini, sistem merekomendasikan langkah-langkah berikut:
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <CheckCircle2 color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.875rem', lineHeight: 1.4 }}>Pusatkan kampanye edukasi pemilahan kertas dan karton di <strong style={{ color: '#fff' }}>Kecamatan Semampir</strong>. Tingkat kontaminasi mencapai 40%.</div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <CheckCircle2 color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.875rem', lineHeight: 1.4 }}>Naikkan insentif poin sebesar 1.5x lipat untuk jenis limbah <strong style={{ color: '#fff' }}>Logam/Kaca</strong> selama minggu depan untuk mendorong pengumpulan.</div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <CheckCircle2 color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.875rem', lineHeight: 1.4 }}>Apresiasi warga <strong style={{ color: '#fff' }}>Surabaya Barat</strong> dengan award zona terbersih bulan ini via integrasi WhatsApp API.</div>
              </div>
            </div>
          </Card>
          
          <Card variant="default">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={18} color="var(--color-text-secondary)" /> Metrik Cara Penghitungan
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Kepatuhan pemilahan dihitung dari persentase kecocokan antara tipe limbah yang dideklarasikan oleh warga dengan konfirmasi aktual penimbangan di TPS3R (variabel <code>wasteMatch</code> pada proses verifikasi).
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
