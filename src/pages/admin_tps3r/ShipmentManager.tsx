import React, { useState, useEffect } from 'react';
import { Truck, Inbox, Calendar, Search, MapPin, CheckCircle } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

export default function ShipmentManager() {
  const [activeTab, setActiveTab] = useState('OUTBOUND'); // OUTBOUND | INBOUND
  const [outboundFilter, setOutboundFilter] = useState('ALL');
  
  const [expeditions, setExpeditions] = useState([]);
  const [pickups, setPickups] = useState([]);
  const { addToast } = useToast();

  useEffect(() => {
    // Simulated fetch calls
    setExpeditions([
      { id: 'EXP-20250524-0042', type: 'TPS3R_TO_MITRA', driver: { name: 'Budi Wibowo' }, destination: 'PT Daur Ulang Nusantara', weight: 120, status: 'ARRIVED', createdAt: '2025-05-24T08:00:00Z' },
      { id: 'EXP-20250524-0043', type: 'TPS3R_TO_TPS3R', driver: { name: 'Andi Supriyadi' }, destination: 'TPS3R Sukamaju', weight: 350, status: 'ON_THE_WAY', createdAt: '2025-05-24T09:30:00Z' }
    ]);

    setPickups([
      { id: 'PKP-100', date: '2025-05-24', customer: 'Andi Darmawan', address: 'Jl. Melati No 5', estWeight: 12, driver: 'Supardi', driverType: 'FREELANCE', status: 'ASSIGNED' },
      { id: 'PKP-101', date: '2025-05-24', customer: 'Sari Rahayu', address: 'Jl. Mawar No 10', estWeight: 25, driver: 'Budi Wibowo', driverType: 'MITRA_TPS3R', status: 'COLLECTED' }
    ]);
  }, []);

  const handleConfirmArrived = (id: string) => {
    setExpeditions(expeditions.map((e: any) => e.id === id ? { ...e, status: 'CONFIRMED' } : e));
    addToast('Penerimaan ekspedisi berhasil dikonfirmasi', 'success');
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ASSIGNED': return <span style={{ padding: '4px 10px', background: '#f1f5f9', color: '#64748b', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>Menunggu</span>;
      case 'ON_THE_WAY': return <span style={{ padding: '4px 10px', background: '#e0f2fe', color: '#0ea5e9', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>Di Jalan</span>;
      case 'ARRIVED': return <span style={{ padding: '4px 10px', background: '#fef3c7', color: '#d97706', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>Tiba</span>;
      case 'CONFIRMED': return <span style={{ padding: '4px 10px', background: '#dcfce7', color: '#166534', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>Selesai</span>;
      case 'COLLECTED': return <span style={{ padding: '4px 10px', background: '#dbeafe', color: '#1e3a8a', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>Diambil</span>;
      default: return null;
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Truck color="#10B981" /> Manajemen Pengiriman
      </h1>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
        <button 
          onClick={() => setActiveTab('OUTBOUND')}
          style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === 'OUTBOUND' ? '#10B981' : 'transparent'}`, color: activeTab === 'OUTBOUND' ? '#10B981' : '#64748b', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Truck size={18} /> Ekspedisi Keluar
        </button>
        <button 
          onClick={() => setActiveTab('INBOUND')}
          style={{ padding: '12px 16px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === 'INBOUND' ? '#10B981' : 'transparent'}`, color: activeTab === 'INBOUND' ? '#10B981' : '#64748b', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Inbox size={18} /> Penjemputan Masuk
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ padding: '8px 16px', borderRadius: '99px', border: 'none', background: '#10B981', color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>Semua</button>
            <button style={{ padding: '8px 16px', borderRadius: '99px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Aktif</button>
            <button style={{ padding: '8px 16px', borderRadius: '99px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 600, fontSize: '0.85rem' }}>Selesai</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', background: '#f8fafc', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <Calendar size={16} /> <span>24 Mei 2025</span>
          </div>
        </div>

        {activeTab === 'OUTBOUND' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#475569', fontSize: '0.85rem' }}>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>No. Surat Jalan</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Tipe</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Driver</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Tujuan</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Berat</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {expeditions.map((exp: any) => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px', fontFamily: 'monospace', fontWeight: 700, color: '#1e293b' }}>{exp.id}</td>
                    <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.85rem' }}>{exp.type === 'TPS3R_TO_MITRA' ? 'Ke Mitra' : 'Ke TPS3R'}</td>
                    <td style={{ padding: '16px 20px', color: '#1e293b', fontWeight: 600 }}>{exp.driver.name}</td>
                    <td style={{ padding: '16px 20px', color: '#475569' }}>{exp.destination}</td>
                    <td style={{ padding: '16px 20px', color: '#10B981', fontWeight: 700 }}>{exp.weight} kg</td>
                    <td style={{ padding: '16px 20px' }}>{getStatusBadge(exp.status)}</td>
                    <td style={{ padding: '16px 20px' }}>
                      {exp.status === 'ARRIVED' ? (
                        <button 
                          onClick={() => handleConfirmArrived(exp.id)}
                          style={{ background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', padding: '6px 12px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <CheckCircle size={14} /> Konfirmasi Diterima
                        </button>
                      ) : (
                        <button style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                          Lihat Detail
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'INBOUND' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#475569', fontSize: '0.85rem' }}>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Tanggal</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Nasabah</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Alamat</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Driver</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Status Driver</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Status Order</th>
                  <th style={{ padding: '16px 20px', fontWeight: 600 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pickups.map((p: any) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '0.85rem' }}>{p.date}</td>
                    <td style={{ padding: '16px 20px', color: '#1e293b', fontWeight: 600 }}>{p.customer}</td>
                    <td style={{ padding: '16px 20px', color: '#475569' }}>{p.address}</td>
                    <td style={{ padding: '16px 20px', color: '#1e293b', fontWeight: 600 }}>{p.driver}</td>
                    <td style={{ padding: '16px 20px' }}>
                      {p.driverType === 'FREELANCE' ? 
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px' }}>Freelance</span> : 
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', background: '#dcfce7', padding: '4px 8px', borderRadius: '6px' }}>Mitra</span>
                      }
                    </td>
                    <td style={{ padding: '16px 20px' }}>{getStatusBadge(p.status)}</td>
                    <td style={{ padding: '16px 20px' }}>
                      {p.status === 'COLLECTED' ? (
                        <button style={{ background: '#10B981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ⚖️ Timbang
                        </button>
                      ) : (
                        <button style={{ background: '#f1f5f9', color: '#64748b', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                          Lihat Detail
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
