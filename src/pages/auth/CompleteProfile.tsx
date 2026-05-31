import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Leaf, ArrowLeft, Info, CheckCircle } from 'lucide-react';
import LeafNetworkBg from '../../components/backgrounds/LeafNetworkBg';

const ROLES = [
  { id: 'RUMAH_TANGGA', label: 'Rumah Tangga', icon: '🏠', desc: 'Jual sampah, dapat poin' },
  { id: 'DRIVER', label: 'Driver / Pengepul', icon: '🚛', desc: 'Jemput sampah, dapat penghasilan' },
  { id: 'CUSTOMER', label: 'Customer Industri', icon: '🏢', desc: 'Beli bahan baku daur ulang' },
  { id: 'ADMIN_TPS3R', label: 'Admin TPS3R', icon: '🏭', desc: 'Kelola fasilitas TPS3R' },
  { id: 'PEMDA', label: 'Pemerintah Daerah', icon: '🏛️', desc: 'Pantau analitik kota' },
];

const ROLE_ROUTE_MAP: Record<string, string> = {
  RUMAH_TANGGA: '/household', DRIVER: '/driver', ADMIN_TPS3R: '/admin',
  CUSTOMER: '/customer', PEMDA: '/pemda',
};

export default function CompleteProfile() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const preAuthToken = searchParams.get('token') || '';
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Details state (same as Register.tsx)
  const [phone, setPhone] = useState('');
  const [houseRole, setHouseRole] = useState('KEPALA_KELUARGA');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [driverType, setDriverType] = useState('FREELANCE');
  const [domicile, setDomicile] = useState('');
  const [industryType, setIndustryType] = useState('INDUSTRI');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPostalCode, setCompanyPostalCode] = useState('');
  const [tpsName, setTpsName] = useState('');
  const [tpsAddress, setTpsAddress] = useState('');
  const [region, setRegion] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');

  // Pre-fill role from sessionStorage if coming from register page
  useEffect(() => {
    const pendingRole = sessionStorage.getItem('pending_role');
    if (pendingRole) {
      setSelectedRole(pendingRole);
      sessionStorage.removeItem('pending_role');
      setStep('details');
    }
    if (!preAuthToken) navigate('/auth/login');
  }, [preAuthToken, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload: any = { preAuthToken, role: selectedRole, phone };
    if (selectedRole === 'RUMAH_TANGGA') Object.assign(payload, { houseRole, address, postalCode });
    else if (selectedRole === 'DRIVER') Object.assign(payload, { driverType, domicile });
    else if (selectedRole === 'CUSTOMER') Object.assign(payload, { industryType, companyAddress, companyPostalCode });
    else if (selectedRole === 'ADMIN_TPS3R') Object.assign(payload, { tpsName, tpsAddress });
    else if (selectedRole === 'PEMDA') Object.assign(payload, { region, officeAddress });

    try {
      const res = await axios.post('/api/auth/google/complete', payload);
      if (res.data.requiresVerification) {
        navigate('/auth/pending-verification');
      } else {
        const u = res.data.user;
        login(res.data.token, {
          id: u.id, email: u.email, name: u.name,
          role: u.role.toLowerCase() as any,
          status: 'active',
        });
        navigate(ROLE_ROUTE_MAP[selectedRole] || '/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', fontFamily: 'inherit' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#fff' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a2318', padding: '2rem 1rem', position: 'relative', overflow: 'hidden' }}>
      <LeafNetworkBg accentColor="#4ade80" opacity={0.9} />
      <div className="auth-page-content" style={{ backgroundColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', width: '100%', maxWidth: '500px', padding: '2.5rem', position: 'relative', zIndex: 10 }}>

        {step === 'details' && (
          <button onClick={() => setStep('role')} style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fff', padding: '0.5rem', borderRadius: '50%' }}>
            <ArrowLeft size={20} />
          </button>
        )}

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', backgroundColor: '#10B981', borderRadius: '1rem', marginBottom: '1rem' }}>
            <Leaf size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
            {step === 'role' ? 'Satu langkah lagi!' : `Lengkapi profil ${ROLES.find(r => r.id === selectedRole)?.label}`}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
            {step === 'role' ? 'Pilih peranmu di e-TrashHub untuk melanjutkan' : 'Isi data berikut untuk menyelesaikan pendaftaran'}
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {step === 'role' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {ROLES.map(r => (
              <button key={r.id} type="button" onClick={() => { setSelectedRole(r.id); setStep('details'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.2s' }}>
                <span style={{ fontSize: '1.75rem' }}>{r.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '2px' }}>{r.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{r.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 'details' && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Nomor Telepon</label>
              <input type="tel" style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} required placeholder="081234567890" />
            </div>

            {selectedRole === 'RUMAH_TANGGA' && (<>
              <div><label style={labelStyle}>Peran di Rumah Tangga</label>
                <select style={inputStyle} value={houseRole} onChange={e => setHouseRole(e.target.value)} required>
                  <option value="KEPALA_KELUARGA">Kepala Keluarga</option>
                  <option value="PASANGAN">Pasangan</option>
                  <option value="ANAK">Anak</option>
                  <option value="LAINNYA">Lainnya</option>
                </select>
              </div>
              <div><label style={labelStyle}>Alamat Lengkap</label><textarea style={{ ...inputStyle, minHeight: '80px' }} value={address} onChange={e => setAddress(e.target.value)} required /></div>
              <div><label style={labelStyle}>Kode Pos</label><input type="number" style={inputStyle} value={postalCode} onChange={e => setPostalCode(e.target.value)} required placeholder="12345" /></div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#6ee7b7', fontSize: '0.875rem' }}><CheckCircle size={16} /> Akun langsung aktif</div>
            </>)}

            {selectedRole === 'DRIVER' && (<>
              <div>
                <label style={labelStyle}>Tipe Driver</label>
                {[{v:'FREELANCE',label:'🚛 Freelance',desc:'Terima order dari siapapun'},{v:'MITRA_TPS3R',label:'🤝 Customer TPS3R',desc:'Terikat dengan TPS3R tertentu'}].map(opt => (
                  <div key={opt.v} onClick={() => setDriverType(opt.v)} style={{ border: `2px solid ${driverType === opt.v ? '#10B981' : 'rgba(255,255,255,0.2)'}`, background: driverType === opt.v ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px', cursor: 'pointer', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 700, color: 'white' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>{opt.desc}</div>
                  </div>
                ))}
              </div>
              <div><label style={labelStyle}>Domisili</label><input type="text" style={inputStyle} value={domicile} onChange={e => setDomicile(e.target.value)} required placeholder="Kecamatan, Kota" /></div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#6ee7b7', fontSize: '0.875rem' }}><CheckCircle size={16} /> Akun langsung aktif</div>
            </>)}

            {selectedRole === 'CUSTOMER' && (<>
              <div>
                <label style={labelStyle}>Tipe</label>
                {[{v:'INDUSTRI',label:'🏭 Industri'},{v:'PENGRAJIN',label:'🎨 Pengrajin'},{v:'PELAJAR',label:'🎓 Pelajar'}].map(opt => (
                  <div key={opt.v} onClick={() => setIndustryType(opt.v)} style={{ border: `2px solid ${industryType === opt.v ? '#10B981' : 'rgba(255,255,255,0.2)'}`, background: industryType === opt.v ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px', cursor: 'pointer', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 700, color: 'white' }}>{opt.label}</div>
                  </div>
                ))}
              </div>
              <div><label style={labelStyle}>Alamat</label><textarea style={{ ...inputStyle, minHeight: '80px' }} value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} required /></div>
              <div><label style={labelStyle}>Kode Pos</label><input type="number" style={inputStyle} value={companyPostalCode} onChange={e => setCompanyPostalCode(e.target.value)} required /></div>
            </>)}

            {selectedRole === 'ADMIN_TPS3R' && (<>
              <div><label style={labelStyle}>Nama TPS3R</label><input type="text" style={inputStyle} value={tpsName} onChange={e => setTpsName(e.target.value)} required placeholder="TPS3R Mawar Berseri" /></div>
              <div><label style={labelStyle}>Alamat TPS3R</label><textarea style={{ ...inputStyle, minHeight: '80px' }} value={tpsAddress} onChange={e => setTpsAddress(e.target.value)} required /></div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', padding: '12px', borderRadius: '12px' }}>
                <Info size={18} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, color: '#fcd34d', fontSize: '0.85rem', lineHeight: 1.5 }}>⏳ Akun akan diverifikasi dalam 1×24 jam.</p>
              </div>
            </>)}

            {selectedRole === 'PEMDA' && (<>
              <div><label style={labelStyle}>Kabupaten/Kota</label><input type="text" style={inputStyle} value={region} onChange={e => setRegion(e.target.value)} required placeholder="Kota Bandung" /></div>
              <div><label style={labelStyle}>Alamat Kantor Dinas</label><textarea style={{ ...inputStyle, minHeight: '80px' }} value={officeAddress} onChange={e => setOfficeAddress(e.target.value)} required /></div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', padding: '12px', borderRadius: '12px' }}>
                <Info size={18} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ margin: 0, color: '#fcd34d', fontSize: '0.85rem', lineHeight: 1.5 }}>⏳ Akun akan diverifikasi dalam 1×24 jam.</p>
              </div>
            </>)}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: '#10B981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '0.5rem' }}>
              {loading ? 'Memproses...' : 'Selesaikan Pendaftaran'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
