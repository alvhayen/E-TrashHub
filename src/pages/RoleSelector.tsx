import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Truck, Factory, Briefcase, Landmark, ChevronRight } from 'lucide-react';

const roles = [
  {
    id: 'RUMAH_TANGGA',
    name: 'Rumah Tangga',
    description: 'Pesan jemputan sampah, dapatkan poin, dan pantau riwayat.',
    email: 'sari@email.com',
    icon: Home,
    color: '#3b82f6',
    bg: '#eff6ff',
  },
  {
    id: 'DRIVER',
    name: 'Driver / Pengepul',
    description: 'Terima tugas penjemputan dan navigasi ke lokasi.',
    email: 'budi.driver@email.com',
    icon: Truck,
    color: '#f59e0b',
    bg: '#fffbeb',
  },
  {
    id: 'ADMIN_TPS3R',
    name: 'Admin TPS3R',
    description: 'Verifikasi timbangan dan manajemen inventaris fasilitas.',
    email: 'admin.tps3r@email.com',
    icon: Factory,
    color: '#8b5cf6',
    bg: '#f5f3ff',
  },
  {
    id: 'MITRA_B2B',
    name: 'Mitra Industri / B2B',
    description: 'Akses katalog komoditas daur ulang dari berbagai TPS3R.',
    email: 'mitra@industri.com',
    icon: Briefcase,
    color: '#ec4899',
    bg: '#fdf2f8',
  },
  {
    id: 'PEMDA',
    name: 'Pemda (Pemerintah)',
    description: 'Pantau analitik eksekutif dan kepatuhan zona harian.',
    email: 'dinas@surabaya.go.id',
    icon: Landmark,
    color: '#10b981',
    bg: '#ecfdf5',
  }
];

export default function RoleSelector() {
  const navigate = useNavigate();

  const handleSelectRole = (roleId: string, email: string) => {
    // Navigate to role onboarding first
    navigate(`/role-onboarding/${roleId}`, { state: { email } });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Pilih Peran Anda</h1>
          <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.5 }}>
            Silakan pilih salah satu peran di bawah ini sesuai dengan peran anda untuk menggunakan aplikasi e-TrashHub.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => handleSelectRole(role.id, role.email)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  width: '100%'
                }}
                className="hover:border-slate-400 hover:shadow-md"
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
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                      {role.name}
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                      {role.description}
                    </p>
                  </div>
                </div>
                <div style={{ color: '#94a3b8' }}>
                  <ChevronRight size={24} />
                </div>
              </button>
            );
          })}
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
