import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, Truck, Factory, Store, Users, ArrowRight, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import LeafNetworkBg from '../components/backgrounds/LeafNetworkBg';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

const ROLE_INFO: Record<string, any> = {
  'RUMAH_TANGGA': {
    title: 'Peran: Rumah Tangga',
    description: 'Sebagai Rumah Tangga, Anda adalah pahlawan lingkungan dari rumah. Pilah sampah Anda, minta penjemputan dengan mudah melalui aplikasi, dan kumpulkan poin reward yang dapat ditukarkan dengan saldo atau uang tunai.',
    email: 'sari@email.com',
    icon: Home,
    color: '#3b82f6', // Blue
    iconBgColor: '#eff6ff',
    themeBg: '#153D32',
    accentColor: '#4ade80',
    opacity: 0.85,
  },
  'DRIVER': {
    title: 'Peran: Driver / Pengepul',
    description: 'Sebagai Pahlawan Kebersihan, Anda bertugas menerima pesanan penjemputan sampah. Gunakan rute yang dioptimalkan dalam aplikasi untuk mencapai lokasi dengan cepat, tingkatkan efisiensi kerja, serta maksimalkan pendapatan harian Anda.',
    email: 'budi.driver@email.com',
    icon: Truck,
    color: '#f59e0b', // Amber
    iconBgColor: '#fffbeb',
    themeBg: '#0c2d4a',
    accentColor: '#34d399',
    opacity: 0.7,
  },
  'ADMIN_TPS3R': {
    title: 'Peran: Admin TPS3R',
    description: 'Sebagai Admin TPS3R, Anda adalah pusat pengelolaan daur ulang. Lakukan pencatatan otomatis berat sampah dari pahlawan kebersihan, kelola inventaris material sirkular, dan jual langsung ke mitra B2B dengan mudah dan transparan.',
    email: 'admin.tps3r@email.com',
    icon: Factory,
    color: '#8b5cf6', // Violet
    iconBgColor: '#f5f3ff',
    themeBg: '#1c1200',
    accentColor: '#86efac',
    opacity: 0.75,
  },
  'CUSTOMER': {
    title: 'Peran: Marketplace',
    description: 'Sebagai pembeli di Marketplace, Anda merupakan penggerak utama ekonomi sirkular. Beli material daur ulang berkualitas secara borongan langsung dari TPS3R terpercaya untuk menunjang kebutuhan Anda.',
    email: 'customer@industri.com',
    icon: Store,
    color: '#ec4899', // Pink
    iconBgColor: '#fdf2f8',
    themeBg: '#0b2e22',
    accentColor: '#6ee7b7',
    opacity: 0.8,
  },
  'PEMDA': {
    title: 'Peran: Untuk Masyarakat',
    description: 'Sebagai Bagian dari Masyarakat, Anda dapat memantau ekosistem cerdas secara transparan. Akses dashboard analitik real-time mengenai volume persampahan, evaluasi kinerja pengelolaan sampah, dan lihat dampak nyatanya.',
    email: 'dinas@balikpapan.go.id',
    icon: Users,
    color: '#10b981', // Emerald
    iconBgColor: '#ecfdf5',
    themeBg: '#0f1f0f',
    accentColor: '#4ade80',
    opacity: 0.85,
  }
};

export default function RoleOnboarding() {
  const navigate = useNavigate();
  const { roleId } = useParams<{ roleId: string }>();
  const location = useLocation();
  const email = location.state?.email || '';
  const { login } = useAuth();

  const role = roleId ? ROLE_INFO[roleId] : null;

  if (!role) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Peran tidak ditemukan.</p>
        <button onClick={() => navigate('/')}>Kembali ke Beranda</button>
      </div>
    );
  }

  const handleStart = async () => {
    if (roleId === 'CUSTOMER' || roleId === 'PEMDA') {
      try {
        const emailMap: Record<string, string> = {
          'CUSTOMER': 'customer@etrashhub.com',
          'PEMDA': 'pemda@etrashhub.com'
        };
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailMap[roleId], password: 'password123' })
        });
        const data = await res.json();
        
        if (data.success) {
          login(data.token, data.user);
          const roleRoutes: Record<string, string> = {
            CUSTOMER: 'customer',
            PEMDA: 'pemda',
          };
          navigate(`/${roleRoutes[roleId]}`);
          return;
        }
      } catch (e) {
        console.error('Auto login failed:', e);
      }
    }
    
    // Default fallback / normal flow for other roles
    navigate(`/auth/login?role=${roleId || 'RUMAH_TANGGA'}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0a2318', overflow: 'hidden', position: 'relative' }}>
      <LeafNetworkBg accentColor="#4ade80" opacity={0.9} />

      <div className="auth-page-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', display: 'flex', zIndex: 10 }}>
          <button 
            onClick={handleBack}
            style={{ 
              background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' 
            }}
            className="hover:bg-white/20 transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem', position: 'relative' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
            >
              <div 
                style={{ 
                  width: '120px', height: '120px', borderRadius: '50%', 
                  backgroundColor: role.iconBgColor, 
                  color: role.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '2rem'
                }}
              >
                {React.createElement(role.icon, { size: 64 })}
              </div>
              
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', lineHeight: 1.2 }}>
                {role.title}
              </h1>
              <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, padding: '0 1rem' }}>
                {role.description}
              </p>
            </motion.div>
          </div>

          <div style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', width: '100%' }}>
            <div style={{ maxWidth: '400px', width: '100%' }}>
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handleStart} 
                style={{ width: '100%', backgroundColor: '#4ade80', color: '#064e3b' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  Mulai Sekarang <ArrowRight size={20} />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

