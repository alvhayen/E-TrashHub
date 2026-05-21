import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Recycle, Home } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div style={{ flex: 1, height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0fdf4', padding: '2rem' }}>
      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <Recycle 
          size={120} 
          color="#16a34a" 
          strokeWidth={1.5}
          style={{ animation: 'spin-slow 10s linear infinite' }} 
        />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '2rem' }}>
          🗑️
        </div>
      </div>
      
      <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#166534', marginBottom: '1rem', textAlign: 'center', letterSpacing: '-0.025em' }}>404</h1>
      <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#14532d', marginBottom: '1rem', textAlign: 'center' }}>
        Halaman ini sudah didaur ulang...
      </h2>
      
      <p style={{ fontSize: '1.25rem', color: '#15803d', textAlign: 'center', maxWidth: '600px', marginBottom: '3rem', lineHeight: 1.6 }}>
        Sepertinya Anda tersesat di tempat pembuangan akhir digital. Mari kembali ke siklus yang benar.
      </p>
      
      <Button 
        size="lg" 
        icon={Home} 
        style={{ backgroundColor: '#16a34a', fontSize: '1.125rem', padding: '1rem 2rem' }}
        onClick={() => {
          if (user?.role) {
            navigate(`/${user.role}`);
          } else {
            navigate('/login');
          }
        }}
      >
        Kembali ke Beranda
      </Button>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
