import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Play, Camera, Truck, Star } from 'lucide-react';
import LeafNetworkBg from '../components/backgrounds/LeafNetworkBg';
import './LandingPage.css';

// Hook for count-up animation
const useCountUpOnView = (endValue, decimals = 0, duration = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTimestamp = null;
          const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease out quad
            const easeProgress = progress * (2 - progress);
            setCount(easeProgress * endValue);
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [endValue, duration, hasAnimated]);

  return { count: count.toFixed(decimals), ref };
};

export default function LandingPage() {
  const navigate = useNavigate();

  const HARDCODED_WASTE_TYPES = [
    { id: '1', name: 'Botol Plastik', slug: 'botol-plastik', priceEstMin: 1500, priceEstMax: 2500, sortingTips: 'Kosongkan sisa air, remukkan botol', imageUrl: '/images/waste/botol-plastik.webp' },
    { id: '2', name: 'Gelas Plastik', slug: 'gelas-plastik', priceEstMin: 1000, priceEstMax: 2000, sortingTips: 'Buang sisa minuman, bersihkan', imageUrl: '/images/waste/gelas-plastik.webp' },
    { id: '3', name: 'Kertas/Kardus', slug: 'kertas-kardus', priceEstMin: 1200, priceEstMax: 1800, sortingTips: 'Lipat kardus, pastikan kertas tidak basah', imageUrl: '/images/waste/kertas-kardus.webp' },
    { id: '4', name: 'Logam/Kaleng', slug: 'logam-kaleng', priceEstMin: 3000, priceEstMax: 5000, sortingTips: 'Kosongkan sisa cairan, remukkan kaleng', imageUrl: '/images/waste/logam-kaleng.webp' },
    { id: '5', name: 'Tutup Botol', slug: 'tutup-botol', priceEstMin: 500, priceEstMax: 1000, sortingTips: 'Pisahkan dari botolnya, kumpulkan dalam wadah', imageUrl: '/images/waste/tutup-botol.webp' },
    { id: '6', name: 'Kain/Tekstil', slug: 'kain-tekstil', priceEstMin: 200, priceEstMax: 500, sortingTips: 'Cuci bersih, lipat rapi', imageUrl: '/images/waste/kain-tekstil.webp' },
  ];

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // Impact counters
  const { count: householdsCount, ref: householdsRef } = useCountUpOnView(1240, 0);
  const { count: wasteCount, ref: wasteRef } = useCountUpOnView(28.5, 1);
  const { count: co2Count, ref: co2Ref } = useCountUpOnView(71.25, 2);
  const { count: citiesCount, ref: citiesRef } = useCountUpOnView(4, 0);



  useEffect(() => {
    // Fetch public waste categories
    fetch('/api/public/waste-categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        } else {
          setCategories(HARDCODED_WASTE_TYPES);
        }
      })
      .catch(err => {
        console.error('Failed to fetch categories:', err);
        setCategories(HARDCODED_WASTE_TYPES);
      })
      .finally(() => {
        setLoadingCats(false);
      });
  }, []);

  const roles = [
    {
      id: 'RUMAH_TANGGA',
      name: 'Rumah Tangga',
      icon: '🏠',
      desc: 'Pilah, jual, dan dapatkan poin dari sampahmu',
      bgClass: 'role-card-rt'
    },
    {
      id: 'DRIVER',
      name: 'Kurir/Volunteer',
      icon: '🛵',
      desc: 'Jemput sampah dan dapatkan penghasilan tambahan',
      bgClass: 'role-card-driver'
    },
    {
      id: 'ADMIN_TPS3R',
      name: 'TPS3R',
      icon: '🏭',
      desc: 'Kelola inventaris dan distribusi ke customer daur ulang',
      bgClass: 'role-card-tps'
    },
    {
      id: 'CUSTOMER',
      name: 'Marketplace',
      icon: '♻️',
      desc: 'Beli bahan baku daur ulang langsung dari sumber terpercaya',
      bgClass: 'role-card-mitra'
    },
    {
      id: 'PEMDA',
      name: 'Untuk Masyarakat',
      icon: '👥',
      desc: 'Pantau statistik pengelolaan sampah skala kota',
      bgClass: 'role-card-pemda'
    }
  ];

  return (
    <div className="landing-page">
      {/* SECTION 1: NAVBAR */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon">♻️</span> e-TrashHub
          </div>
          <div className="nav-links">
            <a href="#cara-kerja">Cara Kerja</a>
            <a href="#tentang">Tentang</a>
            <a href="#dampak">Dampak</a>
          </div>
          <div className="nav-actions">
            <button 
              className="btn-solid"
              onClick={() => document.getElementById('roles')?.scrollIntoView({behavior: 'smooth'})}
            >
              Bergabung Sekarang
            </button>
            <button className="mobile-menu"><Menu size={24} /></button>
          </div>
        </div>
      </nav>

      {/* SECTION 2: HERO */}
      <header className="hero-section">
        <LeafNetworkBg className="hero-bg" />
        <div className="hero-container">
          <div className="hero-content">
            <div className="eyebrow-pill">Platform Pengelolaan Sampah #1 di Indonesia</div>
            <h1 className="hero-title">Sampahmu punya nilai.<br />Kami yang jemput.</h1>
            <p className="hero-subtitle">
              e-TrashHub menghubungkan rumah tangga, pengepul, TPS3R, dan industri dalam satu ekosistem yang menguntungkan semua pihak.
            </p>
            <div className="hero-cta-group">
              <button className="btn-primary-large" onClick={() => navigate('/role-onboarding/RUMAH_TANGGA')}>
                Mulai Jual Sampah →
              </button>
              <button className="btn-ghost-large" onClick={() => document.getElementById('cara-kerja')?.scrollIntoView({behavior: 'smooth'})}>
                <Play size={20} /> Pelajari Cara Kerjanya
              </button>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="floating-card card-1">
              <div className="card-dot dot-green"></div>
              <span>+235 poin • Botol Plastik 3.5kg</span>
            </div>
            <div className="floating-card card-2">
              <div className="card-dot dot-blue"></div>
              <span>🚛 Driver sedang dalam perjalanan...</span>
            </div>
            <div className="floating-card card-3">
              <div className="card-dot dot-amber"></div>
              <span>TPS3R: Stok 200kg Siap</span>
            </div>
          </div>
        </div>
      </header>

      {/* SECTION 3: ANGKA DAMPAK */}
      <section id="dampak" className="impact-section">
        <div className="impact-grid" ref={householdsRef}>
          <div className="impact-item">
            <h3 className="impact-number">{householdsCount}+</h3>
            <p className="impact-label">Rumah Tangga Aktif</p>
          </div>
          <div className="impact-item" ref={wasteRef}>
            <h3 className="impact-number">{wasteCount} Ton</h3>
            <p className="impact-label">Sampah Terkelola</p>
          </div>
          <div className="impact-item" ref={co2Ref}>
            <h3 className="impact-number">{co2Count} Ton</h3>
            <p className="impact-label">CO₂ Dicegah</p>
          </div>
          <div className="impact-item" ref={citiesRef}>
            <h3 className="impact-number">{citiesCount}</h3>
            <p className="impact-label">Kota Terlayani</p>
          </div>
        </div>
      </section>

      {/* SECTION 4: CARA KERJA */}
      <section id="cara-kerja" className="how-it-works-section">
        <div className="section-header">
          <h2>Semudah foto, pilah, dan tunggu dijemput</h2>
        </div>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-icon-wrapper"><Camera size={32} /></div>
            <h3>1. Pilah sampahmu</h3>
            <p>Foto sampahmu, AI langsung bantu identifikasi jenis dan estimasi beratnya</p>
          </div>
          <div className="step-card">
            <div className="step-icon-wrapper"><Truck size={32} /></div>
            <h3>2. Pesan penjemputan</h3>
            <p>Pilih jadwal, driver terdekat langsung datang ke rumahmu</p>
          </div>
          <div className="step-card">
            <div className="step-icon-wrapper"><Star size={32} /></div>
            <h3>3. Dapat poin & dampak</h3>
            <p>Setiap kilogram menghasilkan poin yang bisa ditukar voucher belanja</p>
          </div>
        </div>
      </section>

      {/* SECTION 5: ROLE SELECTOR */}
      <section id="roles" className="role-selector-section">
        <div className="section-header center">
          <h2>Siapa kamu di ekosistem ini?</h2>
          <p>e-TrashHub punya tempat untuk semua orang dalam rantai pengelolaan sampah</p>
        </div>
        <div className="roles-grid">
          {roles.map(role => (
            <div 
              key={role.id} 
              className={`role-card ${role.bgClass}`}
              onClick={() => navigate(`/role-onboarding/${role.id}`)}
            >
              <div className="role-icon">{role.icon}</div>
              <h3 className="role-name">{role.name}</h3>
              <p className="role-desc">{role.desc}</p>
              <button className="btn-role-action">Mulai →</button>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: KATALOG SAMPAH PUBLIK */}
      <section className="catalog-section">
        <div className="section-header center">
          <h2>Sampah apa yang bisa kamu jual?</h2>
          <p>Lihat harga estimasi sebelum mulai — tidak perlu daftar dulu</p>
        </div>
        
        <div className="catalog-grid">
          {!loadingCats && categories.length > 0 ? categories.map(cat => (
            <div key={cat.id} className="catalog-card">
              <div className="catalog-img-placeholder">
                <img src={cat.imageUrl} alt={cat.name} onError={(e) => { const target = e.currentTarget; target.style.display = 'none'; if (target.nextElementSibling) { (target.nextElementSibling as HTMLElement).style.display = 'flex'; } }} />
                <div className="img-fallback" style={{display: 'none'}}>{cat.name[0]}</div>
              </div>
              <div className="catalog-info">
                <h3>{cat.name}</h3>
                <p className="catalog-price">Rp {cat.priceEstMin.toLocaleString('id-ID')} – {cat.priceEstMax.toLocaleString('id-ID')} / kg</p>
                <p className="catalog-tips">{cat.sortingTips}</p>
              </div>
            </div>
          )) : (
            Array.from({length: 5}).map((_, i) => (
              <div key={i} className="catalog-card skeleton">
                <div className="skeleton-img"></div>
                <div className="skeleton-text-1"></div>
                <div className="skeleton-text-2"></div>
                <div className="skeleton-text-3"></div>
              </div>
            ))
          )}
        </div>
        
        <div className="catalog-action">
          <button className="btn-primary-large" onClick={() => navigate('/catalog?context=sell')}>
            Mulai Jual Sampahmu Sekarang →
          </button>
        </div>
      </section>

      {/* SECTION 7: TESTIMONI */}
      <section className="testimonials-section">
        <div className="testimonials-container">
          <div className="testimonial-card">
            <div className="testi-header">
              <div className="avatar">AD</div>
              <div className="testi-meta">
                <h4>Andi Darmawan</h4>
                <p>Rumah Tangga</p>
              </div>
            </div>
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p className="quote">"Sangat mudah! Tinggal kumpulin botol plastik dan kardus, driver datang. Bulan lalu poin saya cukup untuk beli token listrik."</p>
          </div>
          <div className="testimonial-card">
            <div className="testi-header">
              <div className="avatar">SR</div>
              <div className="testi-meta">
                <h4>Sari Rahayu</h4>
                <p>Driver Customer TPS3R</p>
              </div>
            </div>
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p className="quote">"Aplikasinya ngebantu banget buat tau rute jemputan yang pas. Penghasilan saya naik hampir 40% semenjak gabung e-TrashHub."</p>
          </div>
          <div className="testimonial-card">
            <div className="testi-header">
              <div className="avatar">BW</div>
              <div className="testi-meta">
                <h4>Budi Wibowo</h4>
                <p>Admin TPS3R Mawar</p>
              </div>
            </div>
            <div className="stars">⭐⭐⭐⭐⭐</div>
            <p className="quote">"Sistem ekspedisi dan inventory-nya juara. Pencatatan yang tadinya manual sekarang serba digital dan transparan."</p>
          </div>
        </div>
      </section>

      {/* SECTION 8: CTA & FOOTER */}
      <footer className="landing-footer">
        <div className="footer-cta">
          <h2>Siap bergabung dalam ekosistem hijau?</h2>
          <div className="footer-cta-buttons">
            <button className="btn-solid-light" onClick={() => document.getElementById('roles')?.scrollIntoView({behavior: 'smooth'})}>Mulai Sekarang</button>
            <button className="btn-outline-light" onClick={() => document.getElementById('tentang')?.scrollIntoView({behavior: 'smooth'})}>Pelajari Lebih Lanjut</button>
          </div>
        </div>
        
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">♻️ e-TrashHub</div>
            <p>Membangun masa depan Indonesia yang lebih bersih dan berkelanjutan melalui teknologi pengelolaan sampah terintegrasi.</p>
          </div>
          <div className="footer-links">
            <div className="link-col">
              <h4>Platform</h4>
              <a href="#">Untuk Rumah Tangga</a>
              <a href="#">Untuk Driver</a>
              <a href="#">Untuk TPS3R</a>
              <a href="#">Untuk Customer Industri</a>
            </div>
            <div className="link-col">
              <h4>Perusahaan</h4>
              <a href="#">Tentang Kami</a>
              <a href="#">Dampak Lingkungan</a>
              <a href="#">Karir</a>
              <a href="#">Kontak</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} e-TrashHub. All rights reserved.</p>
          <div className="social-links">
            <a href="#">Instagram</a>
            <a href="#">Twitter</a>
            <a href="#">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
