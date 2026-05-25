import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import LoginGateModal from '../../components/auth/LoginGateModal';
import './WasteCatalog.css';

export default function WasteCatalog() {
  const [searchParams] = useSearchParams();
  const context = searchParams.get('context') || 'sell'; // 'sell' | 'buy'
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showGate, setShowGate] = useState(false);

  useEffect(() => {
    fetch('/api/public/waste-categories')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCategories(data.categories);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleActionClick = () => {
    // Determine the role they are likely trying to assume based on context
    const expectedRole = context === 'sell' ? 'RUMAH_TANGGA' : 'MITRA_B2B';
    // User is assumed to be unauthenticated here because this is a public page flow.
    // Show login gate instead of navigating immediately.
    setShowGate(true);
  };

  return (
    <div className="waste-catalog-page">
      <header className="catalog-header">
        <div className="catalog-container">
          <button className="back-btn" onClick={() => navigate(-1)}>← Kembali</button>
          <h1>{context === 'sell' ? 'Sampah yang bisa kamu jual' : 'Bahan baku yang tersedia'}</h1>
          <p>
            {context === 'sell' 
              ? 'Pilah sampahmu sesuai kategori di bawah ini untuk mendapatkan estimasi harga terbaik.' 
              : 'Temukan bahan baku daur ulang berkualitas yang telah disortir oleh mitra TPS3R kami.'}
          </p>
          
          <div className="search-bar">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Cari kategori sampah..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="catalog-main catalog-container">
        {loading ? (
          <div className="catalog-loading">Memuat katalog...</div>
        ) : (
          <div className="waste-grid">
            {filteredCategories.map(cat => (
              <div key={cat.id} className="waste-card" onClick={() => setSelectedCategory(cat)}>
                <div className="waste-img-wrapper">
                  <img src={cat.imageUrl} alt={cat.name} onError={(e) => { e.currentTarget.style.display = 'none'; if (e.currentTarget.nextElementSibling instanceof HTMLElement) e.currentTarget.nextElementSibling.style.display = 'flex'; }} />
                  <div className="img-fallback" style={{display: 'none'}}>{cat.name[0]}</div>
                </div>
                <div className="waste-info">
                  <h3>{cat.name}</h3>
                  <div className="price-tag">Rp {cat.priceEstMin.toLocaleString('id-ID')} - {cat.priceEstMax.toLocaleString('id-ID')} / kg</div>
                  <div className="tips-pill">Cara Pilah: {cat.sortingTips}</div>
                </div>
                <div className="card-hover-action">
                  <span>Lihat Detail</span>
                </div>
              </div>
            ))}
            {filteredCategories.length === 0 && (
              <div className="no-results">Tidak ada kategori yang cocok dengan pencarian Anda.</div>
            )}
          </div>
        )}
      </main>

      {/* Modal Detail */}
      {selectedCategory && (
        <div className="modal-backdrop" onClick={() => setSelectedCategory(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedCategory(null)}><X size={24} /></button>
            
            <div className="modal-img">
              <img src={selectedCategory.imageUrl} alt={selectedCategory.name} onError={(e) => { e.currentTarget.style.display = 'none'; if (e.currentTarget.nextElementSibling instanceof HTMLElement) e.currentTarget.nextElementSibling.style.display = 'flex'; }} />
              <div className="img-fallback" style={{display: 'none'}}>{selectedCategory.name[0]}</div>
            </div>
            
            <div className="modal-body">
              <h2>{selectedCategory.name}</h2>
              <div className="price-tag large">Estimasi: Rp {selectedCategory.priceEstMin.toLocaleString('id-ID')} - {selectedCategory.priceEstMax.toLocaleString('id-ID')} / kg</div>
              
              <div className="modal-section">
                <h4>Deskripsi</h4>
                <p>{selectedCategory.description}</p>
              </div>
              
              <div className="modal-section step-section">
                <h4>Cara Pilah yang Benar</h4>
                <p>{selectedCategory.sortingTips}</p>
              </div>
              
              <button className="btn-modal-action" onClick={handleActionClick}>
                {context === 'sell' ? 'Jual Sampah Ini →' : 'Cek Stok Tersedia →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Gate */}
      {showGate && (
        <LoginGateModal 
          contextAction={context === 'sell' ? 'mulai jual sampahmu' : 'melihat stok bahan baku'} 
          targetRole={context === 'sell' ? 'RUMAH_TANGGA' : 'MITRA_B2B'}
          onClose={() => setShowGate(false)} 
        />
      )}
    </div>
  );
}
