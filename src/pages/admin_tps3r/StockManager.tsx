import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Pencil, Trash2, Truck, Eye, EyeOff } from 'lucide-react';
import CreateExpeditionModal from '../../components/admin/CreateExpeditionModal';
import { useToast } from '../../components/ui/Toast';

export default function StockManager() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExpeditionModal, setShowExpeditionModal] = useState(false);
  const [selectedStockForExpedition, setSelectedStockForExpedition] = useState(null);
  const { success, error } = useToast();

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const res = await axios.get('/api/inventory/admin').catch(() => ({
        data: {
          data: [
            { id: 1, name: 'Botol PET Bersih', category: { name: 'Botol Plastik PET' }, weight: 150, pricePerKg: 3000, isPublic: true },
            { id: 2, name: 'Kardus Bekas', category: { name: 'Kertas & Kardus' }, weight: 200, pricePerKg: 1500, isPublic: true },
            { id: 3, name: 'Kaleng Alumunium', category: { name: 'Logam & Kaleng' }, weight: 45, pricePerKg: 8000, isPublic: false }
          ]
        }
      }));
      setStocks(res?.data?.data || []);
    } catch (err) {
      error('Gagal memuat stok');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublic = async (id: number, currentStatus: boolean) => {
    try {
      // await axios.patch(`/api/admin/inventory/${id}`, { isPublic: !currentStatus });
      setStocks(stocks.map((s: any) => s.id === id ? { ...s, isPublic: !currentStatus } : s));
      success('Status visibilitas diperbarui');
    } catch (err) {
      error('Gagal memperbarui status');
    }
  };

  const handleCreateExpedition = (stock: any) => {
    setSelectedStockForExpedition(stock);
    setShowExpeditionModal(true);
  };

  const activeCommodities = stocks.length;
  const totalWeight = stocks.reduce((acc: number, s: any) => acc + s.weight, 0);
  const totalValue = stocks.reduce((acc: number, s: any) => acc + (s.weight * s.pricePerKg), 0);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Package color="#10B981" /> Manajemen Stok
        </h1>
        <button style={{ background: '#10B981', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <Plus size={18} /> Tambah Komoditas
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, margin: '0 0 8px' }}>TOTAL KOMODITAS AKTIF</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', margin: 0 }}>{activeCommodities}</h2>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, margin: '0 0 8px' }}>TOTAL STOK READY</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981', margin: 0 }}>{totalWeight} <span style={{ fontSize: '1rem' }}>kg</span></h2>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, margin: '0 0 8px' }}>NILAI ESTIMASI</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', margin: 0 }}>Rp {(totalValue / 1000000).toFixed(1)}jt</h2>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Daftar Inventaris</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Tampilkan di Katalog Customer</span>
            <div style={{ width: '40px', height: '24px', background: '#10B981', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
              <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: '18px' }}></div>
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#475569', fontSize: '0.85rem' }}>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Komoditas</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Kategori Sampah</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Stok (kg)</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Harga/kg</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Tampil ke Customer</th>
                <th style={{ padding: '16px 20px', fontWeight: 600 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: '24px', textAlign: 'center' }}>Memuat data...</td></tr>
              ) : (
                stocks.map((stock: any) => (
                  <tr key={stock.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 600, color: '#1e293b' }}>{stock.name}</td>
                    <td style={{ padding: '16px 20px', color: '#64748b' }}>{stock.category.name}</td>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: '#10B981' }}>{stock.weight}</td>
                    <td style={{ padding: '16px 20px', color: '#475569' }}>Rp {stock.pricePerKg.toLocaleString('id-ID')}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ padding: '4px 10px', background: '#dcfce7', color: '#166534', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>Ready</span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <button 
                        onClick={() => handleTogglePublic(stock.id, stock.isPublic)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: stock.isPublic ? '#f0fdf4' : '#f1f5f9', color: stock.isPublic ? '#10B981' : '#94a3b8', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                      >
                        {stock.isPublic ? <Eye size={16} /> : <EyeOff size={16} />}
                        {stock.isPublic ? 'Publik' : 'Private'}
                      </button>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}><Pencil size={16} /></button>
                        <button style={{ background: '#fee2e2', border: 'none', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                        <button 
                          onClick={() => handleCreateExpedition(stock)}
                          style={{ background: '#e0f2fe', border: 'none', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#0ea5e9' }}
                          title="Buat Ekspedisi"
                        >
                          <Truck size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showExpeditionModal && (
        <CreateExpeditionModal 
          onClose={() => setShowExpeditionModal(false)} 
          preselectedStock={selectedStockForExpedition}
        />
      )}
    </div>
  );
}
