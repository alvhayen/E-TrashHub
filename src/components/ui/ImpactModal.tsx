import React, { useState, useEffect } from 'react';
import { X, Heart, TrendingUp, ShieldCheck, TreePine } from 'lucide-react';
import './ImpactModal.css';

export default function ImpactModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('etrashhub_has_seen_impact');
    if (!hasSeen) {
      // Delay kecil agar UX lebih natural (tidak langsung nabrak saat page load)
      const timer = setTimeout(() => {
        setShouldRender(true);
        // Delay sangat kecil untuk memicu transisi CSS
        setTimeout(() => setIsOpen(true), 50);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('etrashhub_has_seen_impact', 'true');
    // Tunggu animasi CSS selesai baru komponen di-unmount
    setTimeout(() => setShouldRender(false), 400);
  };

  if (!shouldRender) return null;

  return (
    <div className={`impact-modal-overlay ${isOpen ? 'open' : ''}`} onClick={handleClose}>
      <div className={`impact-modal-content ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="impact-modal-close" onClick={handleClose} aria-label="Tutup pop-up">
          <X size={20} />
        </button>
        
        <div className="impact-modal-header">
          <div className="impact-modal-icon-ring">
            <TreePine size={32} color="#10B981" />
          </div>
          <h2>Lebih Dari Sekadar Jual Sampah 🌍</h2>
        </div>

        <div className="impact-modal-body">
          <p className="impact-modal-intro">
            Tahukah kamu? Setiap kali kamu menggunakan <strong>e-TrashHub</strong>, kamu tidak hanya mendapatkan penghasilan tambahan, tapi juga berkontribusi nyata menyelamatkan bumi kita.
          </p>

          <div className="impact-feature-list">
            <div className="impact-feature-item">
              <div className="ifi-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                <TrendingUp size={20} />
              </div>
              <div className="ifi-text">
                <h4>Ekonomi Sirkular</h4>
                <p>Sampahmu jadi bahan baku bernilai tinggi bagi industri daur ulang, memutar roda ekonomi lokal.</p>
              </div>
            </div>
            
            <div className="impact-feature-item">
              <div className="ifi-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                <Heart size={20} />
              </div>
              <div className="ifi-text">
                <h4>Bantu Kurir & Pahlawan Lingkungan</h4>
                <p>Kamu memberikan peluang penghasilan langsung bagi para kurir dan pekerja TPS3R di sekitarmu.</p>
              </div>
            </div>
            
            <div className="impact-feature-item">
              <div className="ifi-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                <ShieldCheck size={20} />
              </div>
              <div className="ifi-text">
                <h4>Cegah Krisis Iklim</h4>
                <p>Memilah sampah dari rumah bantu cegah jutaan ton gas metana dan CO₂ dari TPA yang menumpuk.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="impact-modal-footer">
          <button className="impact-btn-primary" onClick={handleClose}>
            Keren! Saya Siap Mulai 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
