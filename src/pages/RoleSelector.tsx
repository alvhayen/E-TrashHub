import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Truck, Factory, Briefcase, Landmark, ChevronRight, ArrowLeft, Lock } from 'lucide-react';
import LeafNetworkBg from '../components/backgrounds/LeafNetworkBg';

const roles = [
  {
    id: 'RUMAH_TANGGA',
    name: 'Rumah Tangga',
    description: 'Pesan jemputan sampah, dapatkan poin, dan pantau riwayat.',
    email: 'sari@email.com',
    icon: Home,
    color: '#3b82f6',
    bg: '#eff6ff',
    access: 'public' as const,
  },
  {
    id: 'DRIVER',
    name: 'Driver / Pengepul',
    description: 'Terima tugas penjemputan dan navigasi ke lokasi.',
    email: 'budi.driver@email.com',
    icon: Truck,
    color: '#14b8a6',
    bg: '#ccfbf1',
    access: 'public' as const,
  },
  {
    id: 'ADMIN_TPS3R',
    name: 'Admin TPS3R',
    description: 'Verifikasi timbangan dan manajemen inventaris fasilitas.',
    email: 'admin.tps3r@email.com',
    icon: Factory,
    color: '#8b5cf6',
    bg: '#f5f3ff',
    access: 'invite' as const,
  },
  {
    id: 'MITRA_B2B',
    name: 'Mitra Industri / B2B',
    description: 'Akses katalog komoditas daur ulang dari berbagai TPS3R.',
    email: 'mitra@industri.com',
    icon: Briefcase,
    color: '#ec4899',
    bg: '#fdf2f8',
    access: 'invite' as const,
  },
  {
    id: 'PEMDA',
    name: 'Pemda (Pemerintah)',
    description: 'Pantau analitik eksekutif dan kepatuhan zona harian.',
    email: 'dinas@balikpapan.go.id',
    icon: Landmark,
    color: '#10b981',
    bg: '#ecfdf5',
    access: 'invite' as const,
  }
];

export default function RoleSelector() {
  const navigate = useNavigate();

  const handleSelectRole = (roleId: string, email: string, access: string) => {
    if (access === 'invite') {
      // Invite-only roles still navigate to onboarding info but login only (demo accounts)
      navigate(`/role-onboarding/${roleId}`, { state: { email } });
    } else {
      navigate(`/role-onboarding/${roleId}`, { state: { email } });
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a2318', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
      <LeafNetworkBg accentColor="#4ade80" opacity={0.9} />
      
      <button 
        onClick={() => navigate('/onboarding')}
        style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '50%', zIndex: 50 }}
        className="hover:bg-white/20"
        aria-label="Kembali ke Onboarding"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="auth-page-content" style={{ maxWidth: '600px', width: '100%', padding: '4rem 1rem 2rem 1rem', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Pilih Peran Anda</h1>
          <p style={{ fontSize: '1rem', lineHeight: 1.5 }}>
            Silakan pilih salah satu peran di bawah ini sesuai dengan peran anda untuk menggunakan aplikasi e-TrashHub.
          </p>
        </div>

        {/* Public roles section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Registrasi Publik</span>
            <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {roles.filter(r => r.access === 'public').map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => handleSelectRole(role.id, role.email, role.access)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    backdropFilter: 'blur(8px)',
                    width: '100%'
                  }}
                  className="hover:border-green-400 hover:bg-white/10"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '48px', height: '48px', borderRadius: '0.75rem', 
                      backgroundColor: role.bg, color: role.color, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
                        {role.name}
                      </h2>
                      <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
                        {role.description}
                      </p>
                    </div>
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    <ChevronRight size={24} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Invite-only roles section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Lock size={10} /> Hanya Undangan / Internal
            </span>
            <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {roles.filter(r => r.access === 'invite').map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => handleSelectRole(role.id, role.email, role.access)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    backdropFilter: 'blur(8px)',
                    width: '100%',
                    opacity: 0.7
                  }}
                  className="hover:border-green-400 hover:bg-white/10"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '48px', height: '48px', borderRadius: '0.75rem', 
                      backgroundColor: role.bg, color: role.color, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>
                          {role.name}
                        </h2>
                        <span style={{
                          fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.08em',
                          padding: '0.15rem 0.4rem', borderRadius: '4px',
                          backgroundColor: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24',
                          border: '1px solid rgba(251, 191, 36, 0.3)',
                          textTransform: 'uppercase'
                        }}>
                          Invite Only
                        </span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
                        {role.description}
                      </p>
                    </div>
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.3)' }}>
                    <ChevronRight size={24} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <button 
            onClick={() => navigate('/login')}
            style={{ 
              background: 'none', border: 'none', color: '#64748b', 
              fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Lewati dan Login Manual
          </button>
        </div>
      </div>
    </div>
  );
}
