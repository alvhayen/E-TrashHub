import React, { useState } from 'react';
import { Wallet, Coins, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';

export default function RedeemPoints({ role }: { role: 'rumah_tangga' | 'driver' }) {
  const { user } = useAuth();
  const toast = useToast();
  
  // Mock points balance for now, can be fetched from API later
  const [currentPoints, setCurrentPoints] = useState(1000); 
  const [pointsToRedeem, setPointsToRedeem] = useState<number | ''>('');
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [walletNumber, setWalletNumber] = useState('');
  
  const wallets = [
    { id: 'gopay', name: 'GoPay', color: '#00AED6' },
    { id: 'ovo', name: 'OVO', color: '#4C3494' },
    { id: 'dana', name: 'DANA', color: '#118EEA' },
    { id: 'shopeepay', name: 'ShopeePay', color: '#EE4D2D' },
  ];

  const conversionRate = 100; // 1 Point = Rp 100

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet) {
      toast.error('Pilih E-Wallet tujuan terlebih dahulu');
      return;
    }
    if (!pointsToRedeem || Number(pointsToRedeem) <= 0) {
      toast.error('Masukkan jumlah poin yang valid');
      return;
    }
    if (Number(pointsToRedeem) > currentPoints) {
      toast.error('Poin tidak mencukupi');
      return;
    }
    if (!walletNumber) {
      toast.error('Masukkan nomor handphone tujuan');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setCurrentPoints(prev => prev - Number(pointsToRedeem));
      setPointsToRedeem('');
      setWalletNumber('');
      setSelectedWallet(null);
      toast.success(`Berhasil menukar ${Number(pointsToRedeem).toLocaleString('id-ID')} poin ke ${wallets.find(w => w.id === selectedWallet)?.name}`);
    }, 1000);
  };

  const accentColor = role === 'rumah_tangga' ? 'var(--role-rumah-tangga)' : 'var(--role-driver)';

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Tukar Poin</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
          Tukarkan poin Anda menjadi saldo E-Wallet
        </p>
      </header>

      <div style={{ 
        background: `linear-gradient(135deg, ${accentColor} 0%, var(--color-bg-primary) 100%)`, 
        borderRadius: '1rem', 
        padding: '1.5rem', 
        marginBottom: '2rem',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
      }}>
        <div>
          <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>Total Poin Anda</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-primary)' }}>
            <Coins size={28} />
            <span style={{ fontSize: '2rem', fontWeight: 700 }}>
              {currentPoints.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right', color: 'var(--color-text-primary)' }}>
          <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>Nilai Tukar</p>
          <p style={{ fontWeight: 600 }}>1 Poin = Rp100</p>
        </div>
      </div>

      <form onSubmit={handleRedeem} style={{ 
        backgroundColor: 'var(--color-surface)', 
        borderRadius: '1rem', 
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border)'
      }}>
        
        {/* Wallet Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
            Pilih E-Wallet Tujuan
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
            {wallets.map(wallet => (
              <button
                key={wallet.id}
                type="button"
                onClick={() => setSelectedWallet(wallet.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: `2px solid ${selectedWallet === wallet.id ? accentColor : 'var(--color-border)'}`,
                  backgroundColor: selectedWallet === wallet.id ? 'var(--color-bg-primary)' : 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  backgroundColor: wallet.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.75rem'
                }}>
                  {wallet.name.substring(0, 2).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{wallet.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount & Number Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
              Nomor Handphone Terdaftar
            </label>
            <input
              type="tel"
              value={walletNumber}
              onChange={(e) => setWalletNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="Contoh: 08123456789"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
              Jumlah Poin
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                value={pointsToRedeem}
                onChange={(e) => setPointsToRedeem(e.target.value ? Number(e.target.value) : '')}
                placeholder="0"
                min="1"
                max={currentPoints}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg-primary)',
                  color: 'var(--color-text-primary)'
                }}
              />
              <button
                type="button"
                onClick={() => setPointsToRedeem(currentPoints)}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.25rem',
                  backgroundColor: accentColor,
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Max
              </button>
            </div>
            
            {pointsToRedeem && Number(pointsToRedeem) > 0 && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ArrowRight size={14} />
                Akan ditukar menjadi: <strong style={{ color: 'var(--color-text-primary)' }}>Rp {(Number(pointsToRedeem) * conversionRate).toLocaleString('id-ID')}</strong>
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!pointsToRedeem || !selectedWallet || !walletNumber || Number(pointsToRedeem) > currentPoints}
          style={{
            width: '100%',
            padding: '0.875rem',
            borderRadius: '0.5rem',
            backgroundColor: accentColor,
            color: '#fff',
            border: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: (!pointsToRedeem || !selectedWallet || !walletNumber || Number(pointsToRedeem) > currentPoints) ? 'not-allowed' : 'pointer',
            opacity: (!pointsToRedeem || !selectedWallet || !walletNumber || Number(pointsToRedeem) > currentPoints) ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <Wallet size={20} />
          Tukar Poin Sekarang
        </button>
      </form>
    </div>
  );
}
