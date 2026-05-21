import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../components/ui/Toast';
import PageContainer from '../../components/layout/PageContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/form/Input';
import { CheckCircle2 } from 'lucide-react';

export default function WeighingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { request, loading } = useApi();
  const { success, error } = useToast();
  
  const [pickup, setPickup] = useState<any>(null);
  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [wasteMatch, setWasteMatch] = useState('yes');

  useEffect(() => {
    request('GET', '/api/pickup/admin').then(data => {
      const found = data.pickups.find((p: any) => p.id === parseInt(id || '0'));
      if (found) setPickup(found);
    });
  }, [id, request]);

  const numWeight = parseFloat(weight) || 0;
  const basePoints = numWeight * 50;
  const bonusPoints = Math.floor(numWeight / 5) * 50;
  const totalPoints = basePoints + bonusPoints;

  const handleSubmit = async () => {
    if (!numWeight || numWeight <= 0) return error('Berat riil harus lebih dari 0');
    if (wasteMatch === 'no' && !note) return error('Catatan wajib diisi jika barang tidak sesuai');

    try {
      await request('POST', `/api/pickup/${id}/verify`, {
        actualWeight: numWeight,
        wasteMatch: wasteMatch === 'yes',
        note
      });
      success(`✅ Verifikasi berhasil! ${totalPoints} poin dikirim ke ${pickup.user?.name}`);
      navigate('/admin_tps3r/incoming');
    } catch (err: any) {
      error(err.response?.data?.error || 'Gagal melakukan verifikasi');
    }
  };

  if (!pickup) return <PageContainer>Memuat data...</PageContainer>;

  return (
    <PageContainer title={`Verifikasi Penimbangan #${pickup.id}`} subtitle="Hitung berat riil dan tentukan poin akhir">
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card variant="bordered" style={{ backgroundColor: '#f8fafc' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Data Panggilan Jemputan</h3>
            <div style={{ fontSize: '1.125rem', fontWeight: 700 }}>{pickup.user?.name}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>{pickup.user?.address}</div>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Jenis Barang (Diminta)</div>
                <div style={{ fontWeight: 600 }}>{pickup.wasteTypes.join(', ')}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Estimasi Berat</div>
                <div style={{ fontWeight: 600 }}>{pickup.estimatedWeight} kg</div>
              </div>
            </div>
          </Card>

          <Card variant="default">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem' }}>Input Verifikasi</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Input 
                label="Berat Riil (kg)" 
                type="number" 
                step="0.1" 
                value={weight} 
                onChange={e => setWeight(e.target.value)} 
                placeholder="0.0"
              />
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Kesesuaian Barang (Apakah isinya sesuai deklarasi?)</label>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" checked={wasteMatch === 'yes'} onChange={() => setWasteMatch('yes')} /> Sesuai
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" checked={wasteMatch === 'no'} onChange={() => setWasteMatch('no')} /> Tidak Sesuai
                  </label>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Catatan Petugas</label>
                <textarea 
                  value={note} onChange={e => setNote(e.target.value)}
                  placeholder={wasteMatch === 'no' ? 'Jelaskan ketidaksesuaian barang (Wajib)' : 'Opsional...'}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontFamily: 'inherit', minHeight: '80px', resize: 'vertical' }}
                />
              </div>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card variant="elevated">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Kalkulator Poin</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Berat Riil</span>
                <span style={{ fontWeight: 600 }}>{numWeight.toFixed(1)} kg</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Poin Dasar (×50/kg)</span>
                <span>{basePoints} pts</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Bonus Scale (per 5kg)</span>
                <span>{bonusPoints} pts</span>
              </div>
              <div style={{ borderTop: '1px solid var(--color-border)', margin: '0.5rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>Total Poin Nasabah</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{totalPoints}</span>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>≈ Rp {totalPoints.toLocaleString()}</div>
            </div>
          </Card>

          <div style={{ padding: '1rem', backgroundColor: '#fef3c7', color: '#b45309', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>Menekan tombol di bawah akan langsung mengirim poin ke akun nasabah dan menandai transaksi selesai.</div>
          </div>

          <Button size="lg" fullWidth onClick={handleSubmit} loading={loading} style={{ backgroundColor: 'var(--role-admin)', fontSize: '1.125rem' }}>
            Verifikasi & Selesaikan
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
