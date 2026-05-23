import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export default function MitraFAQ() {
  const [openIndex, setIndexOpen] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Bagaimana cara melihat ketersediaan stok material?',
      answer: 'Anda dapat masuk ke menu "Katalog Material". Di sana, semua material yang telah dikumpulkan dan diverifikasi oleh berbagai TPS3R akan ditampilkan beserta detailnya (berat, jenis, tingkat kualitas).'
    },
    {
      question: 'Bagaimana prosedur untuk membeli atau pre-order material sampah?',
      answer: 'Untuk saat ini, Anda dapat mencari material yang sesuai dengan kebutuhan industri Anda di Katalog. Setelah menemukan material, hubungi TPS3R terkait melalui kontak yang mungkin tersedia atau gunakan fitur pembelian (jika integrasi pembayaran aktif). Detail sistem pembayaran mungkin akan ditambahkan pada pembaruan mendatang.'
    },
    {
      question: 'Apakah ada batas minimum untuk mengambil/membeli stok dari TPS3R?',
      answer: 'Setiap TPS3R atau jenis material mungkin memiliki ketentuan batas minimal yang berbeda yang dikonfigurasikan di sistem mereka. Namun biasanya diukur dalam puluhan hingga ratusan kilogram sesuai dengan efisiensi transport logistik industri.'
    },
    {
      question: 'Apakah saya bisa melacak pengiriman dari TPS3R setelah melakukan transaksi?',
      answer: 'Fitur pelacakan pengiriman material massal secara real-time untuk Mitra B2B akan hadir dalam pengembangan fitur berikutnya. Untuk sekarang, koordinasi dilakukan antara armada B2B dan admin TPS3R secara langsung setelah transaksi sukses.'
    },
    {
      question: 'Bagaimana jika kualitas material tidak sesuai dengan yang ada di Katalog ketika barang sampai?',
      answer: 'Setiap TPS3R telah diinstruksikan untuk memverifikasi ulang stoknya sebelum masuk ke inventori. Jika terjadi ketidaksesuaian kualitas dalam jumlah volume besar, Anda bisa melakukan eskalasi melalui support center kami agar bisa diklarifikasi dengan pihak TPS3R tersebut.'
    }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '0.75rem', backgroundColor: '#e2e8f0', color: '#153D32', borderRadius: '0.75rem' }}>
          <HelpCircle size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
            FAQ & Panduan Mitra
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            Informasi umum seputar cara operasional B2B dengan TPS3R dan ekosistem aplikasi.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {faqs.map((faq, index) => (
          <Card key={index} variant="elevated" padding="md" style={{ cursor: 'pointer', transition: 'all 0.2s', borderLeft: openIndex === index ? '4px solid #10b981' : '4px solid transparent' }} onClick={() => setIndexOpen(openIndex === index ? null : index)}>
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
