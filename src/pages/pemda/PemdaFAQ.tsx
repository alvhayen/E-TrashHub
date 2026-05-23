import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export default function PemdaFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Apa fungsi utama dari dashboard Dinas LH / Pemda?',
      answer: 'Dashboard ini berfungsi sebagai pusat pemantauan (monitoring) secara real-time untuk mengevaluasi volume sampah yang berhasil dikurangi di sumber, kinerja tiap TPS3R dalam melakukan pengumpulan dan pemilahan, serta tingkat kepatuhan program yang terhubung langsung sebagai jembatan (bridge) agregasi data ke platform SIPSN secara otomatis.'
    },
    {
      question: 'Bagaimana cara melihat akumulasi timbulan sampah di seluruh TPS3R daerah ini?',
      answer: 'Anda dapat melihat akumulasi total timbulan dan komposisi sampah pada bagian "Timbulan". Menu ini merangkum data secara makro dan memberikan visibilitas tren komprehensif harian, mingguan, maupun bulanan yang bisa disaring berdasarkan wilayah spesifik.'
    },
    {
      question: 'Apa yang dimaksud dengan metrik "Kepatuhan" dan bagaimana cara menggunakannya?',
      answer: 'Halaman "Kepatuhan" digunakan untuk melihat detail performa masing-masing stasiun TPS3R. Anda bisa mengevaluasi apakah suatu titik TPS3R secara rutin memverifikasi data dan memenuhi target pengurangan volume. TPS3R yang berada di bawah target bisa diidentifikasi untuk dibina lebih lanjut.'
    },
    {
      question: 'Apakah hasil rekap data ini bisa diekspor untuk format pelaporan resmi ke Kementerian LHK?',
      answer: 'Ya, pada menu "Laporan", seluruh matriks laporan dapat diunduh (termasuk format yang kompatibel dengan SIPSN nasional Pusat). Hal ini akan mempercepat integrasi pelaporan tahunan tanpa rekapitulasi data manual yang merepotkan.'
    },
    {
      question: 'Siapa saja yang memiliki akses ke dashboard ini?',
      answer: 'Hak akses saat ini hanya diberikan kepada figur administrator lingkungan daerah (Dinas Lingkungan Hidup) yang memiliki kredensial resmi. Detail akses akun dapat dikelola lebih lanjut oleh admin instansi Pemda.'
    }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '0.75rem', backgroundColor: '#dcfce7', color: '#059669', borderRadius: '0.75rem' }}>
          <HelpCircle size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
            FAQ & Panduan Pemda
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            Informasi umum seputar cara memonitor data, evaluasi kepatuhan, serta integrasi SIPSN untuk Pemerintah Daerah.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {faqs.map((faq, index) => (
          <Card key={index} variant="elevated" padding="md" style={{ cursor: 'pointer', transition: 'all 0.2s', borderLeft: openIndex === index ? '4px solid #059669' : '4px solid transparent' }} onClick={() => setOpenIndex(openIndex === index ? null : index)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>{faq.question}</h3>
              <div style={{ color: '#64748b' }}>
                {openIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>
            {openIndex === index && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', color: '#475569', lineHeight: 1.6 }}>
                {faq.answer}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
