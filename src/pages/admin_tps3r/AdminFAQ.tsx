import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function AdminFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Bagaimana cara memverifikasi penjemputan sampah?',
      answer: 'Pergi ke menu "Masuk", pilih penjemputan dengan status "Dibawa (ON THE WAY)" atau "Terkumpul (COLLECTED)". Setelah ditimbang, masukkan detail berat dan jenis sampah, lalu klik verifikasi.'
    },
    {
      question: 'Apa fungsi halaman Inventori?',
      answer: 'Halaman Inventori digunakan untuk melacak total stok sampah yang telah dikumpulkan, diverifikasi, dan dikelompokkan berdasarkan jenis (Misal: Plastik, Kertas, Logam). Data inventori ini nantinya bisa dibeli oleh Customer.'
    },
    {
      question: 'Bagaimana cara melihat performa TPS3R?',
      answer: 'Anda dapat melihat ringkasan volume sampah harian di menu "Dashboard". Untuk detail lebih rinci secara berkala, silakan akses ke menu "Laporan".'
    },
    {
      question: 'Apa yang harus dilakukan jika ada kesalahan timbangan saat verifikasi?',
      answer: 'Saat ini proses verifikasi final dilakukan di halaman timbangan. Jika ada kesalahan setelah disimpan, hubungi Administrator Sistem Pemda untuk koreksi data secara manual.'
    },
    {
      question: 'Bagaimana Customer membeli stok sampah TPS3R?',
      answer: 'Customer yang sudah terdaftar akan dapat melihat keseluruhan inventori Anda melalui akses Katalog mereka. Anda hanya bertugas memastikan jumlah inventori atau stok yang masuk sudah di-update melalui proses Verifikasi TPS.'
    }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
        Panduan & FAQ Admin TPS3R
      </h1>
      <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '2rem' }}>
        Temukan panduan cepat serta jawaban dari pertanyaan yang sering diajukan mengenai operasional sistem admin TPS3R.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {faqs.map((faq, index) => (
          <Card key={index} variant="bordered" padding="md" style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }} onClick={() => setOpenIndex(openIndex === index ? null : index)}>
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
