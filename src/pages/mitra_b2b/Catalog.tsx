import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Search, MapPin, Package, MessageCircle } from 'lucide-react';

export default function Catalog() {
  const { request, loading } = useApi();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterStock, setFilterStock] = useState('All');

  useEffect(() => {
    // In a real scenario, this endpoint might be different and fetch across all TPS3R. 
    request('GET', '/api/inventory').then(data => {
      setInventory(data.inventory || []);
    }).catch(console.error);
  }, [request]);

  const filteredItems = inventory.filter(item => {
    if (search && !item.commodity.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== 'All' && !item.commodity.toLowerCase().includes(filterType.toLowerCase())) return false;
    if (filterStock === '50kg+' && item.stockKg < 50) return false;
    if (filterStock === '100kg+' && item.stockKg < 100) return false;
    if (filterStock === '200kg+' && item.stockKg < 200) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <section style={{ 
        backgroundColor: '#153D32', 
        borderRadius: 'var(--radius-2xl)', 
        padding: '3rem 2rem',
        color: '#fff',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decorative patterns */}
        <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '300px', height: '300px', backgroundColor: '#34d399', opacity: 0.1, borderRadius: '50%', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-50%', right: '-10%', width: '400px', height: '400px', backgroundColor: '#34d399', opacity: 0.1, borderRadius: '50%', filter: 'blur(50px)' }} />

        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, position: 'relative', zIndex: 1 }}>Marketplace Material Daur Ulang</h1>
        <p style={{ fontSize: '1.125rem', opacity: 0.9, maxWidth: '600px', position: 'relative', zIndex: 1 }}>
          Temukan pasokan material daur ulang berkualitas tinggi, terverifikasi langsung dari TPS3R.
        </p>
        
        <div style={{ 
          position: 'relative', 
          width: '100%', 
          maxWidth: '700px',
          display: 'flex',
          alignItems: 'center',
          marginTop: '1rem',
          zIndex: 1
        }}>
          <Search size={24} style={{ position: 'absolute', left: '1.5rem', color: '#153D32' }} />
          <input 
            type="text" 
            placeholder="🔍 Cari jenis material daur ulang..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '1.25rem 1.5rem 1.25rem 4rem',
              borderRadius: '9999px',
              border: 'none',
              outline: 'none',
              fontSize: '1.125rem',
              color: '#1e293b',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            }}
          />
        </div>
      </section>

      <section style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginRight: '0.5rem' }}>Filter Katalog</div>
        <select 
          value={filterType} 
          onChange={e => setFilterType(e.target.value)}
          style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: '#fff', minWidth: '180px', outline: 'none' }}
        >
          <option value="All">Semua Jenis</option>
          <option value="Plastik">Plastik (PET, HDPE...)</option>
          <option value="Kertas">Kertas & Karton</option>
          <option value="Logam">Logam & Besi</option>
          <option value="Kain">Tekstil & Kain</option>
          <option value="Kaca">Kaca</option>
        </select>

        <select 
          value={filterLocation} 
          onChange={e => setFilterLocation(e.target.value)}
          style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: '#fff', minWidth: '180px', outline: 'none' }}
        >
          <option value="All">Semua Lokasi TPS3R</option>
          <option value="Surabaya Barat">Surabaya Barat</option>
          <option value="Surabaya Timur">Surabaya Timur</option>
        </select>

        <select 
          value={filterStock} 
          onChange={e => setFilterStock(e.target.value)}
          style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', backgroundColor: '#fff', minWidth: '180px', outline: 'none' }}
        >
          <option value="All">Semua Stok Minimum</option>
          <option value="50kg+">Stok &gt; 50 kg</option>
          <option value="100kg+">Stok &gt; 100 kg</option>
          <option value="200kg+">Stok &gt; 200 kg</option>
        </select>
      </section>

      <section>
        {loading && inventory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-secondary)' }}>Memuat katalog material...</div>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--color-text-secondary)', backgroundColor: '#fff', borderRadius: 'var(--radius-xl)' }}>
            <Package size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>Tidak ada material ditemukan</h3>
            <p>Coba sesuaikan filter atau gunakan kata kunci pencarian yang berbeda.</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {filteredItems.map(item => (
              <Card key={item.id} variant="elevated" hoverable padding="lg" style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid transparent', transition: 'border 0.2s', ':hover': { border: '1px solid #34d399' } } as any}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div style={{ 
                    width: '3.5rem', height: '3.5rem', borderRadius: 'var(--radius-md)', 
                    backgroundColor: '#ecfdf5', color: '#153D32',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Package size={28} />
                  </div>
                  <Badge status="READY" />
                </div>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.3 }}>{item.commodity}</h3>
                
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#153D32', marginBottom: '1.5rem' }}>
                  Rp {item.pricePerKg.toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>/ kg</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    <div style={{ backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}><Package size={16} color="#64748b" /></div>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{item.stockKg} kg</span> tersedia
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    <div style={{ backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}><MapPin size={16} color="#64748b" /></div>
                    TPS3R Surabaya Barat 📍
                  </div>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Button 
                    fullWidth 
                    icon={MessageCircle} 
                    style={{ backgroundColor: '#25D366', color: '#fff', fontSize: '1rem', padding: '0.75rem' }}
                    onClick={() => {
                      const text = encodeURIComponent(`Halo, saya tertarik dengan ${item.commodity} sebanyak ${item.stockKg} kg dari TPS3R Surabaya Barat. Apakah tersedia?`);
                      window.open(`https://wa.me/628123456789?text=${text}`, '_blank');
                    }}
                  >
                    Tanya via WhatsApp
                  </Button>
                  <Button 
                    fullWidth 
                    variant="ghost" 
                    style={{ color: '#153D32', border: '1px solid var(--color-border)' }}
                    onClick={() => navigate(`/mitra_b2b/material/${item.id}`)}
                  >
                    Lihat Spesifikasi →
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
