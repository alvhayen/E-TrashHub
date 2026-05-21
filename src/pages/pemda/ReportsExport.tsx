import React from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Printer, Download, FileSignature } from 'lucide-react';

export default function ReportsExport() {
  const currentMonth = "Mei 2026";
  const printedAt = new Date().toLocaleString('id-ID');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="print-hide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>Export Laporan (SIPSN)</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.125rem' }}>Buat laporan rekapitulasi standar format kementerian</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="outline" icon={Download}>Export PDF</Button>
          <Button icon={Printer} style={{ backgroundColor: '#059669' }} onClick={handlePrint}>Cetak Laporan</Button>
        </div>
      </div>

      <Card variant="default" className="print-container" style={{ backgroundColor: '#fff', border: '1px solid var(--color-border)', boxShadow: 'none' }}>
        {/* Printable Area Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>Pemerintah Kota Surabaya</h2>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Laporan Timbulan & Pengurangan Sampah Berkala</h1>
          <div style={{ fontSize: '1rem', marginTop: '0.5rem' }}>Periode: {currentMonth}</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2rem' }}>
          
          <section>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, backgroundColor: '#f1f5f9', padding: '0.5rem 1rem', borderLeft: '4px solid #059669', marginBottom: '1rem' }}>1. Ringkasan Eksekutif</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', padding: '0 1rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Total Timbulan Terkelola</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>350.2 Ton</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Persentase Pengurangan</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>24.5%</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Tingkat Kepatuhan Warga</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>85.0%</div>
              </div>
            </div>
          </section>

          <section>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, backgroundColor: '#f1f5f9', padding: '0.5rem 1rem', borderLeft: '4px solid #059669', marginBottom: '1rem' }}>2. Data Penyerapan via TPS3R</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={{ padding: '0.75rem', border: '1px solid #e2e8f0', textAlign: 'left' }}>No.</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #e2e8f0', textAlign: 'left' }}>Nama Fasilitas</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #e2e8f0', textAlign: 'right' }}>Volume Anorganik (kg)</th>
                  <th style={{ padding: '0.75rem', border: '1px solid #e2e8f0', textAlign: 'right' }}>Konversi B2B (kg)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>1</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>TPS3R Surabaya Barat</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0', textAlign: 'right' }}>135,000</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0', textAlign: 'right' }}>120,500</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>2</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0' }}>TPS3R Mulyorejo</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0', textAlign: 'right' }}>115,200</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0', textAlign: 'right' }}>100,100</td>
                </tr>
                <tr style={{ fontWeight: 700 }}>
                  <td colSpan={2} style={{ padding: '0.75rem', border: '1px solid #e2e8f0', textAlign: 'right' }}>TOTAL</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0', textAlign: 'right' }}>250,200</td>
                  <td style={{ padding: '0.75rem', border: '1px solid #e2e8f0', textAlign: 'right' }}>220,600</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, backgroundColor: '#f1f5f9', padding: '0.5rem 1rem', borderLeft: '4px solid #059669', marginBottom: '1rem' }}>3. Pengesahan Dokumen</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2rem 1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '4rem' }}>Disiapkan Oleh,</div>
                <div style={{ fontWeight: 700, textDecoration: 'underline' }}>Sistem Administrator</div>
                <div>(SIPSN-Bridge Automator)</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '4rem' }}>Surabaya, {new Date().toLocaleDateString('id-ID')} <br/> Mengetahui,</div>
                <div style={{ fontWeight: 700, textDecoration: 'underline' }}>Kepala Dinas Lingkungan Hidup</div>
                <div>NIP. __________________</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', marginTop: '1rem', color: '#64748b', fontSize: '0.75rem' }}>
                  <FileSignature size={14} /> Dokumen valid digital
                </div>
              </div>
            </div>
          </section>

        </div>
        
        <div style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>Doc. Ref: SIPSN-B-DLH/{new Date().getTime().toString().slice(-6)}</span>
          <span>Dicetak otomatis pada: {printedAt}</span>
        </div>
      </Card>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-hide {
            display: none !important;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
