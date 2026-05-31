import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Truck, Building2, MapPin } from 'lucide-react';
import { useToast } from '../ui/Toast';

export default function CreateExpeditionModal({ onClose, preselectedStock }: { onClose: () => void, preselectedStock?: any }) {
  const [step, setStep] = useState(1);
  const [expeditionType, setExpeditionType] = useState('TPS3R_TO_MITRA');
  const [destinationId, setDestinationId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [weight, setWeight] = useState(preselectedStock ? preselectedStock.weight : 0);
  const [notes, setNotes] = useState('');
  
  const [destinations, setDestinations] = useState([]);
  const [drivers, setDrivers] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    // Mock fetch for dropdowns
    if (step === 2) {
      // Simulated API call: axios.get(expeditionType === 'TPS3R_TO_TPS3R' ? '/api/admin/tps3r-list' : '/api/admin/mitra-list')
      setDestinations([
        { id: '1', name: expeditionType === 'TPS3R_TO_TPS3R' ? 'TPS3R Sukamaju' : 'PT Daur Ulang Nusantara' },
        { id: '2', name: expeditionType === 'TPS3R_TO_TPS3R' ? 'TPS3R Berkah Alam' : 'CV Plastik Jaya' }
      ]);
    } else if (step === 3) {
      // Simulated API call: axios.get('/api/admin/mitra-drivers')
      setDrivers([
        { id: 'd1', name: 'Andi Supriyadi', domicile: 'Kebayoran' },
        { id: 'd2', name: 'Budi Wibowo', domicile: 'Tebet' }
      ]);
    }
  }, [step, expeditionType]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simulated POST /api/expedition
      await new Promise(r => setTimeout(r, 1000));
      success('Ekspedisi berhasil dibuat! Surat Jalan: EXP-20250524-0099');
      onClose();
    } catch (err) {
      error('Gagal membuat ekspedisi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '600px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.25rem' }}>Buat Ekspedisi Baru</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= step ? '#10B981' : '#e2e8f0' }} />
            ))}
          </div>

          {step === 1 && (
            <div>
              <h3 style={{ marginBottom: '16px' }}>Step 1: Pilih Tipe Ekspedisi</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div 
                  onClick={() => setExpeditionType('TPS3R_TO_TPS3R')}
                  style={{ border: `2px solid ${expeditionType === 'TPS3R_TO_TPS3R' ? '#10B981' : '#e2e8f0'}`, background: expeditionType === 'TPS3R_TO_TPS3R' ? '#f0fdf4' : 'white', padding: '24px', borderRadius: '16px', cursor: 'pointer', textAlign: 'center' }}
                >
                  <Building2 size={32} color={expeditionType === 'TPS3R_TO_TPS3R' ? '#10B981' : '#94a3b8'} style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontWeight: 700 }}>🏭 → 🏭</div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>Kirim ke TPS3R Lain</div>
                </div>
                <div 
                  onClick={() => setExpeditionType('TPS3R_TO_MITRA')}
                  style={{ border: `2px solid ${expeditionType === 'TPS3R_TO_MITRA' ? '#10B981' : '#e2e8f0'}`, background: expeditionType === 'TPS3R_TO_MITRA' ? '#f0fdf4' : 'white', padding: '24px', borderRadius: '16px', cursor: 'pointer', textAlign: 'center' }}
                >
                  <Truck size={32} color={expeditionType === 'TPS3R_TO_MITRA' ? '#10B981' : '#94a3b8'} style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontWeight: 700 }}>🏭 → 🏢</div>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>Kirim ke Mitra Industri</div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ marginBottom: '16px' }}>Step 2: Pilih Tujuan</h3>
              <select 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                value={destinationId} onChange={e => setDestinationId(e.target.value)}
              >
                <option value="">-- Pilih Tujuan --</option>
                {destinations.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 style={{ marginBottom: '16px' }}>Step 3: Pilih Driver Mitra</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {drivers.map((d: any) => (
                  <div 
                    key={d.id} onClick={() => setDriverId(d.id)}
                    style={{ border: `2px solid ${driverId === d.id ? '#10B981' : '#e2e8f0'}`, padding: '16px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
                  >
                    <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🚛</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{d.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Domisili: {d.domicile}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 style={{ marginBottom: '16px' }}>Step 4: Konfirmasi Muatan</h3>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>Item Terpilih:</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #cbd5e1' }}>
                  <span>{preselectedStock ? preselectedStock.name : 'Multiple Items'}</span>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>Total Berat Dikirim (kg)</label>
                  <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }} />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h3 style={{ marginBottom: '16px' }}>Step 5: Catatan Tambahan</h3>
              <textarea 
                value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Instruksi tambahan untuk driver..."
                style={{ width: '100%', height: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', resize: 'none' }}
              />
            </div>
          )}

        </div>

        <div style={{ padding: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', background: '#f8fafc' }}>
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} style={{ padding: '12px 24px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Kembali</button>
          ) : <div></div>}
          
          {step < 5 ? (
            <button onClick={() => setStep(s => s + 1)} style={{ padding: '12px 24px', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Lanjut →</button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} style={{ padding: '12px 24px', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
              {loading ? 'Memproses...' : 'Kirim Ekspedisi'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
