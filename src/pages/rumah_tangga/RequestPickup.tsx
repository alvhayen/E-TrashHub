import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Trash2, Box, FileText, Database, Plus, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ToggleCard from '../../components/form/ToggleCard';

const WASTE_TYPES = [
  { id: 'Botol Plastik', icon: Package, label: 'Botol Plastik', sublabel: 'PET, HDPE' },
  { id: 'Gelas Plastik', icon: Trash2, label: 'Gelas Plastik', sublabel: 'PP, Minuman' },
  { id: 'Tutup Botol', icon: Box, label: 'Tutup Botol', sublabel: 'Plastik keras' },
  { id: 'Kertas/Kardus', icon: FileText, label: 'Kertas/Kardus', sublabel: 'Kering & bersih' },
  { id: 'Logam/Kaleng', icon: Database, label: 'Logam/Kaleng', sublabel: 'Aluminium' },
  { id: 'Lainnya', icon: Plus, label: 'Lainnya', sublabel: 'Kaca, dll' }
];

const WEIGHT_ESTIMATES = [
  { id: 'ringan', label: 'Ringan (<2kg)', val: 1.5, points: '~75 pts' },
  { id: 'sedang', label: 'Sedang (2-5kg)', val: 3.5, points: '~175 pts' },
  { id: 'berat', label: 'Berat (>5kg)', val: 6, points: '~300+ pts' }
];

export default function RequestPickup() {
  const { user } = useAuth();
  const { request, loading } = useApi();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedWeight, setSelectedWeight] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const toggleType = (id: string) => {
    setSelectedTypes(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const currentWeightObj = WEIGHT_ESTIMATES.find(w => w.id === selectedWeight);

  const handleSubmit = async () => {
    if (selectedTypes.length === 0) return error('Pilih minimal 1 jenis sampah!');
    if (!selectedWeight || !currentWeightObj) return error('Pilih estimasi berat!');

    try {
      await request('POST', '/api/pickup', {
        wasteTypes: selectedTypes,
        estimatedWeight: currentWeightObj.val,
        address: user?.address || 'Alamat tidak diinput',
        note: note
      });
      success('Penjemputan berhasil dipesan! 🎉');
      navigate('/rumah_tangga/history');
    } catch (err: any) {
      error(err.response?.data?.error || 'Gagal memesan penjemputan');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <header style={{ padding: '1.5rem', backgroundColor: '#fff', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Pesan Jemputan</h1>
      </header>

      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1 }}>
        {/* Waste Types */}
        <section>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>1. Pilih Jenis Sampah (Bisa &gt;1)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            {WASTE_TYPES.map(type => (
              <ToggleCard
                key={type.id}
                icon={type.icon}
                label={type.label}
                sublabel={type.sublabel}
                selected={selectedTypes.includes(type.id)}
                onClick={() => toggleType(type.id)}
              />
            ))}
          </div>
        </section>

        {/* Weight Estimate */}
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
            💡 Kirim {'>'}5 kg = +50 poin bonus ekstra!
          </div>
        </section>

        {/* Address and Notes */}
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
      </div>

      <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderTop: '1px solid var(--color-border)', position: 'sticky', bottom: 0, zIndex: 10 }}>
        <Button 
          fullWidth size="lg" 
          onClick={handleSubmit} 
          loading={loading}
          disabled={selectedTypes.length === 0 || !selectedWeight}
        >
          🚛 Pesan Penjemputan
        </Button>
      </div>
    </div>
  );
}
