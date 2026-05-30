import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Info, ExternalLink, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import axios from 'axios';
import { getWasteImage } from '../../utils/wasteImages';

const WasteScanner = lazy(() => import('../../components/ai/WasteScanner'));

const HARDCODED_WASTE_TYPES = [
  { id: 'Botol Plastik', name: 'Botol Plastik', slug: 'botol-plastik', priceEstMin: 1500, priceEstMax: 2500, imageUrl: '' },
  { id: 'Gelas Plastik', name: 'Gelas Plastik', slug: 'gelas-plastik', priceEstMin: 1000, priceEstMax: 2000, imageUrl: '' },
  { id: 'Kertas/Kardus', name: 'Kertas/Kardus', slug: 'kertas-kardus', priceEstMin: 1200, priceEstMax: 1800, imageUrl: '' },
  { id: 'Logam/Kaleng', name: 'Logam/Kaleng', slug: 'logam-kaleng', priceEstMin: 3000, priceEstMax: 5000, imageUrl: '' },
  { id: 'Lainnya', name: 'Lainnya', slug: 'lainnya', priceEstMin: 0, priceEstMax: 0, imageUrl: '' }
];

const WEIGHT_ESTIMATES = [
  { id: 'ringan', label: 'Ringan (<2kg)', val: 1.5, points: '~75 pts' },
  { id: 'sedang', label: 'Sedang (2-5kg)', val: 3.5, points: '~175 pts' },
  { id: 'berat', label: 'Berat (>5kg)', val: 6, points: '~300+ pts' }
];

export default function RequestPickup() {
  const { user } = useAuth();
  const { request, loading: submitLoading } = useApi();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedWeight, setSelectedWeight] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const handleScanComplete = (analysis: any) => {
    if (analysis.detectedItems && analysis.detectedItems.length > 0) {
      const detectedCategories = analysis.detectedItems
        .map((item: any) => item.categoryLabel)
        .filter(Boolean);
      
      setSelectedTypes(prev => {
        const newTypes = [...prev];
        detectedCategories.forEach((cat: string) => {
          if (!newTypes.includes(cat)) {
            newTypes.push(cat);
          }
        });
        return newTypes;
      });
    }

    if (analysis.estimatedWeight) {
      let weightId = '';
      if (analysis.estimatedWeight.toLowerCase() === 'ringan') weightId = 'ringan';
      if (analysis.estimatedWeight.toLowerCase() === 'sedang') weightId = 'sedang';
      if (analysis.estimatedWeight.toLowerCase() === 'berat') weightId = 'berat';
      if (weightId) setSelectedWeight(weightId);
    }
    
    success('AI: Form berhasil diisi otomatis! ✨');
  };

  useEffect(() => {
    axios.get('/api/public/waste-categories')
      .then(res => {
        if (res.data.success && res.data.categories.length > 0) {
          setCategories(res.data.categories);
        } else {
          setCategories(HARDCODED_WASTE_TYPES);
        }
      })
      .catch(() => {
        setCategories(HARDCODED_WASTE_TYPES);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleType = (id: string) => {
    setSelectedTypes(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const currentWeightObj = WEIGHT_ESTIMATES.find(w => w.id === selectedWeight);

  const handleSubmit = async () => {
    if (selectedTypes.length === 0) return error('Pilih minimal 1 jenis sampah!');
    if (!selectedWeight || !currentWeightObj) return error('Pilih estimasi berat!');

    try {
      await request('POST', '/api/pickup', {
        wasteTypes: selectedTypes, // Using IDs or names
        estimatedWeight: currentWeightObj.val,
        address: user?.address || 'Alamat tidak diinput',
        note: note
      });
      success('Penjemputan berhasil dipesan! 🎉');
      // Add 1.5s delay to show the success state before redirecting
      setTimeout(() => {
        navigate('/household/history');
      }, 1500);
    } catch (err: any) {
      error(err.response?.data?.error || 'Gagal memesan penjemputan');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <header className="page-header">
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Pesan Jemputan</h1>
      </header>

      <div className="request-pickup-layout" style={{ flex: 1 }}>
        <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <section>
            <div style={{ marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
                  padding: '0.875rem 1rem',
                  borderRadius: '0.875rem',
                  border: '2px solid #16a34a',
                  backgroundColor: '#f0fdf4',
                  color: '#15803d',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  transition: 'all 0.15s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#dcfce7';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(22,163,74,0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0fdf4';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Sparkles size={20} />
                📷 Scan Sampah dengan AI
                <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.125rem 0.375rem', backgroundColor: '#16a34a', color: '#fff', borderRadius: '999px', marginLeft: '0.25rem' }}>
                  BARU
                </span>
              </button>
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', margin: '0.5rem 0 0' }}>
                Foto sampahmu → AI isi form otomatis ✨
              </p>
            </div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>1. Pilih Jenis Sampah (Bisa &gt;1)</h2>
            <div className="waste-type-grid">
              {loading ? (
                Array.from({length: 6}).map((_, i) => (
                  <div key={i} className="skeleton-card" style={{ height: '180px', borderRadius: '12px', background: '#e2e8f0', animation: 'pulse 1.5s infinite' }}></div>
                ))
              ) : (
                categories.map(cat => {
                  const isSelected = selectedTypes.includes(cat.id || cat.name);
                  const imageUrl = cat.imageUrl || getWasteImage(cat.slug);
                  
                  return (
                    <div 
                      key={cat.id || cat.name}
                      onClick={() => toggleType(cat.id || cat.name)}
                      style={{
                        background: 'white',
                        border: `2px solid ${isSelected ? '#10B981' : '#e2e8f0'}`,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        transform: isSelected ? 'translateY(-2px)' : 'none',
                        boxShadow: isSelected ? '0 8px 16px rgba(16, 185, 129, 0.15)' : 'none',
                        position: 'relative'
                      }}
                    >
                      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#f1f5f9' }}>
                        <img 
                          src={imageUrl} 
                          alt={cat.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e: any) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                        <div style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: '#cbd5e1' }}>
                          {cat.name[0]}
                        </div>
                        
                        {/* Selected Overlays */}
                        {isSelected && (
                          <>
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(16, 185, 129, 0.1)' }}></div>
                            <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#10B981', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>✓</div>
                          </>
                        )}
                      </div>
                      
                      <div style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.name}</div>
                        {cat.priceEstMin > 0 ? (
                          <div style={{ color: '#10B981', fontSize: '11px', fontWeight: 600 }}>
                            Rp {cat.priceEstMin.toLocaleString('id-ID')} - {cat.priceEstMax.toLocaleString('id-ID')}<span style={{ color: '#94a3b8', fontWeight: 500 }}>/kg</span>
                          </div>
                        ) : (
                          <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 500 }}>Harga Bervariasi</div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <button 
              onClick={() => navigate('/catalog?context=sell')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#0ea5e9', fontSize: '0.85rem', fontWeight: 600, marginTop: '16px', cursor: 'pointer' }}
            >
              <Info size={16} /> Tidak yakin ini sampah apa? → Lihat Panduan Pilah Sampah
            </button>
          </section>

          <section>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>2. Estimasi Berat</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {WEIGHT_ESTIMATES.map(we => (
                <button
                  key={we.id}
                  onClick={() => setSelectedWeight(we.id)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1rem', borderRadius: 'var(--radius-lg)',
                    border: `2px solid ${selectedWeight === we.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: selectedWeight === we.id ? 'rgba(16, 185, 129, 0.05)' : '#fff',
                    fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontWeight: 600, color: selectedWeight === we.id ? 'var(--color-primary)' : 'inherit' }}>{we.label}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-tertiary)' }}>{we.points}</span>
                </button>
              ))}
            </div>
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#d97706', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', fontWeight: 600 }}>
              💡 Kirim &gt;5 kg = +50 poin bonus ekstra!
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>3. Detail Penjemputan</h2>
            <Card variant="bordered" padding="sm" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ color: 'var(--color-primary)', marginTop: '0.25rem' }}><MapPin size={20} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>Alamat Pengambilan</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.5 }}>
                    {user?.address || 'Alamat belum diatur, silakan perbarui di Profil Anda.'}
                  </div>
                </div>
              </div>
            </Card>
            
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Catatan untuk driver (opsional, misal: titip di pos satpam)"
              style={{
                width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)', fontFamily: 'inherit',
                fontSize: '0.875rem', minHeight: '100px', resize: 'vertical'
              }}
            />
          </section>

          <div className="submit-desktop-only">
            <Button 
              fullWidth size="lg" 
              onClick={handleSubmit} 
              loading={submitLoading}
              disabled={selectedTypes.length === 0 || !selectedWeight}
            >
              🚛 Pesan Penjemputan
            </Button>
          </div>
        </div>
      </div>

      <div className="submit-mobile-sticky" style={{ padding: '1.5rem', backgroundColor: '#fff', borderTop: '1px solid var(--color-border)', position: 'sticky', bottom: 0, zIndex: 10 }}>
        <Button 
          fullWidth size="lg" 
          onClick={handleSubmit} 
          loading={submitLoading}
          disabled={selectedTypes.length === 0 || !selectedWeight}
        >
          🚛 Pesan Penjemputan
        </Button>
      </div>

      {showScanner && (
        <Suspense fallback={null}>
          <WasteScanner
            onAnalysisComplete={handleScanComplete}
            onClose={() => setShowScanner(false)}
          />
        </Suspense>
      )}

      <style>{`
        .waste-type-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .submit-mobile-sticky { display: block; }
        .submit-desktop-only { display: none; }

        @media (min-width: 1024px) {
          .waste-type-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .submit-mobile-sticky { display: none; }
          .submit-desktop-only { display: block; }
        }
      `}</style>
    </div>
  );
}
