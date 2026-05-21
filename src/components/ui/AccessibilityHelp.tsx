import React, { useState, useEffect } from 'react';
import { HelpCircle, X, Contrast } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const getContextualHelp = (pathname: string) => {
  if (pathname.includes('/rumah_tangga/request')) return 'Halaman ini digunakan untuk memesan penjemputan sampah. Isi formulir dengan jenis sampah, estimasi berat, dan alamat Anda.';
  if (pathname.includes('/rumah_tangga/history')) return 'Ini adalah halaman riwayat transaksi Anda. Anda dapat melihat status penjemputan sebelumnya di sini.';
  if (pathname.includes('/rumah_tangga/pickup/')) return 'Detail penjemputan aktif Anda. Pantau status penjemputan secara waktu nyata (real-time) di halaman ini.';
  if (pathname.includes('/rumah_tangga')) return 'Beranda Rumah Tangga. Anda dapat melihat ringkasan poin, dampak lingkungan, dan jemputan aktif Anda di sini.';
  
  if (pathname.includes('/driver/route')) return 'Halaman rute. Di sini Anda bisa melihat urutan penjemputan yang efisien menuju lokasi nasabah.';
  if (pathname.includes('/driver')) return 'Dasbor Driver. Lihat daftar tugas penjemputan Anda hari ini dan perbarui status setelah penjemputan selesai.';
  
  if (pathname.includes('/admin_tps3r/incoming')) return 'Penerimaan TPS3R. Lakukan verifikasi dan penimbangan aktual untuk sampah yang baru tiba.';
  if (pathname.includes('/admin_tps3r/inventory')) return 'Manajemen Inventaris. Pantau stok komoditas daur ulang yang siap dijual ke Mitra B2B.';
  
  if (pathname.includes('/pemda')) return 'Dasbor Eksekutif Pemda. Pantau metrik pengolahan sampah, kepatuhan zona, dan ekspor data di sini.';
  
  return 'Selamat datang di e-TrashHub. Gunakan navigasi untuk mengakses berbagai fitur.';
};

export default function AccessibilityHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [helpText, setHelpText] = useState('');
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    setHelpText(getContextualHelp(location.pathname));
  }, [location.pathname]);

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    if (!highContrast) {
      document.documentElement.style.setProperty('--color-primary', '#000000');
      document.documentElement.style.setProperty('--color-text-primary', '#000000');
      document.documentElement.style.setProperty('--color-text-secondary', '#000000');
      document.documentElement.style.setProperty('--color-bg-primary', '#ffffff');
      document.documentElement.style.filter = 'contrast(1.2) saturate(1.2)';
    } else {
      document.documentElement.style.setProperty('--color-primary', '#10b981');
      document.documentElement.style.setProperty('--color-text-primary', '#0f172a');
      document.documentElement.style.setProperty('--color-text-secondary', '#64748b');
      document.documentElement.style.setProperty('--color-bg-primary', '#f8fafc');
      document.documentElement.style.filter = 'none';
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Bantuan Suara dan Aksesibilitas"
        style={{
          position: 'fixed',
          bottom: '100px', // Above bottom nav
          right: '1.5rem',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#0f172a',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: 'none',
          cursor: 'pointer',
          zIndex: 9999,
          transition: 'transform 0.2s',
        }}
        className="hover:scale-110"
      >
        <HelpCircle size={28} />
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '160px',
          right: '1.5rem',
          width: 'calc(100vw - 3rem)',
          maxWidth: '320px',
          backgroundColor: '#fff',
          borderRadius: '1rem',
          padding: '1.25rem',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
          zIndex: 9999,
          border: '2px solid #e2e8f0',
          animation: 'slideUpSelect 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle size={20} color="#3b82f6" /> Bantuan Layar
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              aria-label="Tutup Bantuan"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#64748b' }}
            >
              <X size={20} />
            </button>
          </div>
          <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#334155' }}>
            {helpText}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <button 
              onClick={() => {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  const utterance = new SpeechSynthesisUtterance(helpText);
                  utterance.lang = 'id-ID';
                  window.speechSynthesis.speak(utterance);
                }
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#0f172a',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}
            >
              🔊 Bacakan Teks
            </button>
            <button 
              onClick={toggleHighContrast}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: highContrast ? '#0f172a' : '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: highContrast ? '#fff' : '#0f172a',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}
            >
              <Contrast size={18} /> Mode Kontras Tinggi
            </button>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slideUpSelect {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
