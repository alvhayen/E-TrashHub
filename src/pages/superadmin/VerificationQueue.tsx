import React, { useState, useEffect } from 'react';
import { Building2, Landmark, Check, X, AlertCircle } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export default function VerificationQueue() {
  const [activeTab, setActiveTab] = useState('ADMIN_TPS3R');
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  
  const { success, error } = useToast();

  useEffect(() => {
    // Simulated fetch
    setTimeout(() => {
      setQueue([
        { id: '1', role: 'ADMIN_TPS3R', date: '24 Mei 2025', name: 'Budi Santoso', email: 'tps.melati@example.com', target: 'TPS3R Melati', address: 'Jl. Melati 10, Jakarta Selatan', phone: '08123456789' },
        { id: '2', role: 'ADMIN_TPS3R', date: '23 Mei 2025', name: 'Siti Rahayu', email: 'tps.mawar@example.com', target: 'TPS3R Mawar', address: 'Jl. Mawar 5, Depok', phone: '08987654321' },
        { id: '3', role: 'PEMDA', date: '22 Mei 2025', name: 'Dinas Lingkungan', email: 'dlh.bogor@example.com', target: 'Kota Bogor', address: 'Balai Kota Bogor', phone: '0251888999' }
      ]);
      setLoading(false);
    }, 600);
  }, []);

  const handleApprove = (id: string) => {
    if (window.confirm('Setujui pendaftaran entitas ini?')) {
      // Simulate PATCH /api/superadmin/queue/:id/approve
      setQueue(queue.filter(q => q.id !== id));
      success('Verifikasi disetujui');
    }
  };

  const handleRejectClick = (item: any) => {
    setSelectedItem(item);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      error('Alasan penolakan wajib diisi');
      return;
    }
    // Simulate PATCH /api/superadmin/queue/:id/reject
    setQueue(queue.filter(q => q.id !== selectedItem.id));
    setRejectModalOpen(false);
    success('Pendaftaran ditolak');
  };

  const filteredQueue = queue.filter(q => q.role === activeTab);

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          Antrian Verifikasi
        </h1>
        {queue.length > 0 && (
          <div style={{ background: '#ef4444', color: 'white', padding: '6px 16px', borderRadius: '99px', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> {queue.length} Pending
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', borderBottom: '2px solid #e2e8f0' }}>
        <button 
          onClick={() => setActiveTab('ADMIN_TPS3R')}
          style={{ padding: '16px 24px', background: 'none', border: 'none', borderBottom: `3px solid ${activeTab === 'ADMIN_TPS3R' ? '#3b82f6' : 'transparent'}`, color: activeTab === 'ADMIN_TPS3R' ? '#3b82f6' : '#64748b', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '-2px' }}
        >
          <Building2 size={20} /> Admin TPS3R ({queue.filter(q => q.role === 'ADMIN_TPS3R').length})
        </button>
        <button 
          onClick={() => setActiveTab('PEMDA')}
          style={{ padding: '16px 24px', background: 'none', border: 'none', borderBottom: `3px solid ${activeTab === 'PEMDA' ? '#3b82f6' : 'transparent'}`, color: activeTab === 'PEMDA' ? '#3b82f6' : '#64748b', fontWeight: 700, fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '-2px' }}
        >
          <Landmark size={20} /> Pemda ({queue.filter(q => q.role === 'PEMDA').length})
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#475569', fontSize: '0.85rem' }}>
                <th style={{ padding: '20px 24px', fontWeight: 600 }}>Tgl Daftar</th>
                <th style={{ padding: '20px 24px', fontWeight: 600 }}>Nama Pemohon</th>
                <th style={{ padding: '20px 24px', fontWeight: 600 }}>Instansi / Target</th>
                <th style={{ padding: '20px 24px', fontWeight: 600 }}>Kontak</th>
                <th style={{ padding: '20px 24px', fontWeight: 600 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Memuat data...</td></tr>
              ) : filteredQueue.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontSize: '1.1rem' }}>Tidak ada antrian di kategori ini 🎉</td></tr>
              ) : (
                filteredQueue.map((q) => (
                  <tr key={q.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.3s' }}>
                    <td style={{ padding: '20px 24px', color: '#64748b', fontSize: '0.9rem' }}>{q.date}</td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>{q.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{q.email}</div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontWeight: 700, color: '#3b82f6', marginBottom: '4px' }}>{q.target}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{q.address}</div>
                    </td>
                    <td style={{ padding: '20px 24px', color: '#475569', fontSize: '0.9rem' }}>
                      {q.phone}
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleApprove(q.id)}
                          style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                        >
                          <Check size={16} /> Setujui
                        </button>
                        <button 
                          onClick={() => handleRejectClick(q)}
                          style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                        >
                          <X size={16} /> Tolak
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

      {rejectModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: '32px' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '1.5rem', fontWeight: 800 }}>Tolak Verifikasi</h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              Anda akan menolak pendaftaran <strong>{selectedItem?.target}</strong>. Harap berikan alasan penolakan yang akan dikirimkan ke email pendaftar.
            </p>
            <textarea 
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Alasan penolakan (wajib diisi)..."
              style={{ width: '100%', height: '120px', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', resize: 'none', marginBottom: '24px', fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setRejectModalOpen(false)}
                style={{ padding: '12px 24px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', color: '#475569' }}
              >
                Batal
              </button>
              <button 
                onClick={handleRejectSubmit}
                style={{ padding: '12px 24px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Konfirmasi Penolakan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
