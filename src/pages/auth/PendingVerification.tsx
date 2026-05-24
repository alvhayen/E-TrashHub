import React from 'react';
import { useNavigate } from 'react-router-dom';
import LeafNetworkBg from '../../components/backgrounds/LeafNetworkBg';

export default function PendingVerification() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a2318', position: 'relative', overflow: 'hidden', padding: '24px' }}>
      <LeafNetworkBg accentColor="#f59e0b" opacity={0.4} />
      
      <div style={{
        background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)', 
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', 
        padding: '48px 32px', width: '100%', maxWidth: '500px', 
        textAlign: 'center', zIndex: 10, position: 'relative'
      }}>
        
        {/* Hourglass custom CSS art */}
        <div style={{ margin: '0 auto 32px', width: '80px', height: '100px', position: 'relative', animation: 'flip 4s infinite ease-in-out' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '50%', borderBottom: '50px solid transparent', borderLeft: '40px solid rgba(245, 158, 11, 0.2)', borderRight: '40px solid rgba(245, 158, 11, 0.2)', borderTop: '50px solid #f59e0b' }}></div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '50%', borderTop: '50px solid transparent', borderLeft: '40px solid rgba(245, 158, 11, 0.2)', borderRight: '40px solid rgba(245, 158, 11, 0.2)', borderBottom: '50px solid #f59e0b' }}></div>
        </div>

        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
          Pendaftaranmu sedang kami proses
        </h1>
        
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '32px' }}>
          Tim e-TrashHub akan memverifikasi data instansi/TPS3R kamu dalam 1×24 jam. Kami akan mengirim pemberitahuan jika akun sudah aktif.
        </p>

        <div style={{ display: 'inline-block', background: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d', padding: '8px 16px', borderRadius: '99px', fontSize: '0.9rem', fontWeight: 600, border: '1px solid rgba(245, 158, 11, 0.3)', marginBottom: '40px' }}>
          🟡 Menunggu Verifikasi
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button 
            onClick={() => navigate('/')}
            style={{ background: '#10B981', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', transition: 'background 0.2s' }}
          >
            Kembali ke Beranda
          </button>
          
          <a 
            href="https://wa.me/628000000000" 
            target="_blank" rel="noreferrer"
            style={{ textDecoration: 'none', background: 'transparent', color: '#10B981', border: '1.5px solid #10B981', padding: '14.5px', borderRadius: '12px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', display: 'block' }}
          >
            Hubungi Kami via WhatsApp
          </a>
        </div>
      </div>
      
      <style>{`
        @keyframes flip {
          0% { transform: rotate(0deg); }
          45% { transform: rotate(0deg); }
          55% { transform: rotate(180deg); }
          100% { transform: rotate(180deg); }
        }
      `}</style>
    </div>
  );
}
