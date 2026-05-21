import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, Truck, Factory, Briefcase, Landmark, ArrowRight, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

const ROLE_INFO: Record<string, any> = {
  'RUMAH_TANGGA': {
    title: 'Peran: Rumah Tangga',
    description: 'Sebagai Rumah Tangga, Anda adalah pahlawan lingkungan dari rumah. Pilah sampah Anda, minta penjemputan dengan mudah melalui aplikasi, dan kumpulkan poin reward yang dapat ditukarkan dengan berbagai hadiah menarik.',
    icon: Home,
    color: '#3b82f6', // Blue
    bgColor: '#eff6ff',
  },
  'DRIVER': {
    title: 'Peran: Driver / Pengepul',
    description: 'Sebagai Pahlawan Kebersihan, Anda bertugas menerima pesanan penjemputan sampah. Gunakan rute yang dioptimalkan dalam aplikasi untuk mencapai lokasi dengan cepat, tingkatkan efisiensi kerja, serta maksimalkan pendapatan harian Anda.',
    icon: Truck,
    color: '#f59e0b', // Amber
    bgColor: '#fffbeb',
  },
  'ADMIN_TPS3R': {
    title: 'Peran: Admin TPS3R',
    description: 'Sebagai Admin TPS3R, Anda adalah pusat pengelolaan daur ulang. Lakukan pencatatan otomatis berat sampah dari pahlawan kebersihan, kelola inventaris material sirkular, dan jual langsung ke mitra B2B dengan mudah dan transparan.',
    icon: Factory,
    color: '#8b5cf6', // Violet
    bgColor: '#f5f3ff',
  },
  'MITRA_B2B': {
    title: 'Peran: Mitra Industri (B2B)',
    description: 'Sebagai Mitra Industri, Anda merupakan penggerak utama ekonomi sirkular. Beli material daur ulang berkualitas secara borongan langsung dari TPS3R terpercaya untuk menunjang kebutuhan bahan baku industri Anda.',
    icon: Briefcase,
    color: '#ec4899', // Pink
    bgColor: '#fdf2f8',
  },
  'PEMDA': {
    title: 'Peran: Pemerintah Daerah',
    description: 'Sebagai Pemerintah Daerah, Anda adalah pemantau ekosistem cerdas. Akses dashboard analitik real-time mengenai volume persampahan masyarakat (RTRW), evaluasi kinerja TPS3R, dan pastikan kepatuhan lingkungan harian berjalan baik.',
    icon: Landmark,
    color: '#10b981', // Emerald
    bgColor: '#ecfdf5',
  }
};

export default function RoleOnboarding() {
  const navigate = useNavigate();
  const { roleId } = useParams<{ roleId: string }>();
  const location = useLocation();
  const email = location.state?.email || '';

  const role = roleId ? ROLE_INFO[roleId] : null;

  if (!role) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Peran tidak ditemukan.</p>
        <button onClick={() => navigate('/roles')}>Kembali ke Pilihan Peran</button>
      </div>
    );
  }

  const handleContinue = () => {
    navigate('/login', { state: { email, password: 'password123' } });
  };

  const handleBack = () => {
    navigate('/roles');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-primary)', overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem', display: 'flex', zIndex: 10 }}>
        <button 
          onClick={handleBack}
          style={{ 
            background: 'none', border: 'none', color: 'var(--color-text-secondary)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' 
          }}
          className="hover:bg-slate-100 transition-colors"
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
                backgroundColor: role.bgColor, 
                color: role.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '2rem'
              }}
            >
              {React.createElement(role.icon, { size: 64 })}
            </div>
            
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-secondary)', marginBottom: '1rem', lineHeight: 1.2 }}>
              {role.title}
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, padding: '0 1rem' }}>
              {role.description}
            </p>
          </motion.div>
        </div>

        <div style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', width: '100%' }}>
          <div style={{ maxWidth: '400px', width: '100%' }}>
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => navigate('/login', { state: { email, password: 'password123' } })} 
              style={{ width: '100%' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                Lanjut ke Login <ArrowRight size={20} />
              </div>
            </Button>
          </div>
          <div style={{ maxWidth: '400px', width: '100%' }}>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate('/register')} 
              style={{ width: '100%' }}
            >
              Belum punya akun? Daftar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
