import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Leaf, ArrowLeft, Info, CheckCircle } from 'lucide-react';
import LeafNetworkBg from '../../components/backgrounds/LeafNetworkBg';

export default function Register() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1 fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2 fields
  // RUMAH_TANGGA
  const [houseRole, setHouseRole] = useState('KEPALA_KELUARGA');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // DRIVER
  const [driverType, setDriverType] = useState('FREELANCE');
  const [domicile, setDomicile] = useState('');

  // MITRA_B2B
  const [industryType, setIndustryType] = useState('INDUSTRI');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPostalCode, setCompanyPostalCode] = useState('');

  // ADMIN_TPS3R
  const [tpsName, setTpsName] = useState('');
  const [tpsAddress, setTpsAddress] = useState('');

  // PEMDA
  const [region, setRegion] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');

  const targetRole = role?.toUpperCase() || 'RUMAH_TANGGA';

  const getRoleLabel = (r: string) => {
    const roles: Record<string, string> = {
      RUMAH_TANGGA: 'Rumah Tangga',
      DRIVER: 'Driver',
      ADMIN_TPS3R: 'Admin TPS3R',
      MITRA_B2B: 'Mitra Industri',
      PEMDA: 'Pemda'
    };
    return roles[r] || r;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload: any = {
      role: targetRole,
      name,
      email,
      password,
      phone
    };

    if (targetRole === 'RUMAH_TANGGA') {
      payload.houseRole = houseRole;
      payload.address = address;
      payload.postalCode = postalCode;
    } else if (targetRole === 'DRIVER') {
      payload.driverType = driverType;
      payload.domicile = domicile;
    } else if (targetRole === 'MITRA_B2B') {
      payload.industryType = industryType;
      payload.companyAddress = companyAddress;
      payload.companyPostalCode = companyPostalCode;
    } else if (targetRole === 'ADMIN_TPS3R') {
      payload.tpsName = tpsName;
      payload.tpsAddress = tpsAddress;
    } else if (targetRole === 'PEMDA') {
      payload.region = region;
      payload.officeAddress = officeAddress;
    }

    try {
      const res = await axios.post('/api/auth/register', payload);
      
      if (res.data.requiresVerification) {
        navigate('/auth/pending-verification');
      } else {
        // Auto login
        login(res.data.token, res.data.user);
        const roleRoutes: Record<string, string> = {
          RUMAH_TANGGA: 'household',
          DRIVER: 'driver',
          ADMIN_TPS3R: 'admin',
          MITRA_B2B: 'mitra',
          PEMDA: 'pemda',
          SUPER_ADMIN: 'superadmin'
        };
        const targetPath = roleRoutes[targetRole.toUpperCase()] || targetRole.toLowerCase();
        navigate(`/${targetPath}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Pendaftaran gagal. Periksa kembali data Anda.');
      setStep(1); // Go back to show error
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#fff' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a2318', padding: '2rem 1rem', position: 'relative', overflow: 'hidden' }}>
      <LeafNetworkBg accentColor="#4ade80" opacity={0.9} />
      <div className="auth-page-content" style={{ backgroundColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', width: '100%', maxWidth: '500px', padding: '2.5rem', position: 'relative', zIndex: 10 }}>
        
        <button 
          onClick={() => step === 2 ? setStep(1) : navigate(-1)}
          style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '50%' }}
        >
          <ArrowLeft size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Mendaftar sebagai {getRoleLabel(targetRole)}</h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '1rem' }}>
            <div style={{ height: '4px', width: '32px', borderRadius: '2px', background: step >= 1 ? '#10B981' : 'rgba(255,255,255,0.2)' }} />
            <div style={{ height: '4px', width: '32px', borderRadius: '2px', background: step >= 2 ? '#10B981' : 'rgba(255,255,255,0.2)' }} />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Langkah {step} dari 2</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleNextStep} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Nama Lengkap</label>
              <input type="text" style={inputStyle} value={name} onChange={e => setName(e.target.value)} required placeholder="Budi Santoso" />
            </div>
            <div>
              <label style={labelStyle}>Alamat Email</label>
              <input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} required placeholder="budi@example.com" />
            </div>
            <div>
              <label style={labelStyle}>Nomor Telepon</label>
              <input type="tel" style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} required placeholder="081234567890" />
            </div>
            <div>
              <label style={labelStyle}>Kata Sandi</label>
              <input type="password" style={inputStyle} value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="Minimal 8 karakter" />
            </div>
            <div>
              <label style={labelStyle}>Konfirmasi Kata Sandi</label>
              <input type="password" style={inputStyle} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={8} placeholder="Ulangi kata sandi" />
            </div>
            
            <button type="submit" style={{ width: '100%', marginTop: '1rem', padding: '14px', background: '#10B981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
              Lanjut →
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {targetRole === 'RUMAH_TANGGA' && (
              <>
                <div>
                  <label style={labelStyle}>Peran di Rumah Tangga</label>
                  <select style={inputStyle} value={houseRole} onChange={e => setHouseRole(e.target.value)} required>
                    <option value="KEPALA_KELUARGA">Kepala Keluarga</option>
                    <option value="PASANGAN">Pasangan</option>
                    <option value="ANAK">Anak</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Alamat Lengkap</label>
                  <textarea style={{...inputStyle, minHeight: '80px'}} value={address} onChange={e => setAddress(e.target.value)} required placeholder="Jl. Sudirman No. 1..." />
                </div>
                <div>
                  <label style={labelStyle}>Kode Pos</label>
                  <input type="number" style={inputStyle} value={postalCode} onChange={e => setPostalCode(e.target.value)} required placeholder="12345" />
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '1rem', color: '#6ee7b7', fontSize: '0.875rem' }}>
                  <CheckCircle size={16} /> Akun langsung aktif setelah daftar
                </div>
              </>
            )}

            {targetRole === 'DRIVER' && (
              <>
                <label style={labelStyle}>Tipe Driver</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  <div 
                    onClick={() => setDriverType('FREELANCE')}
                    style={{ border: `2px solid ${driverType === 'FREELANCE' ? '#10B981' : 'rgba(255,255,255,0.2)'}`, background: driverType === 'FREELANCE' ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', cursor: 'pointer' }}
                  >
                    <div style={{ fontWeight: 700, color: 'white', marginBottom: '4px', fontSize: '1rem' }}>🚛 Freelance</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Terima order dari siapapun, jadwal fleksibel</div>
                  </div>
                  <div 
                    onClick={() => setDriverType('MITRA_TPS3R')}
                    style={{ border: `2px solid ${driverType === 'MITRA_TPS3R' ? '#10B981' : 'rgba(255,255,255,0.2)'}`, background: driverType === 'MITRA_TPS3R' ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', cursor: 'pointer' }}
                  >
                    <div style={{ fontWeight: 700, color: 'white', marginBottom: '4px', fontSize: '1rem' }}>🤝 Mitra TPS3R</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Terikat dengan TPS3R tertentu, termasuk tugas ekspedisi</div>
                  </div>
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <label style={labelStyle}>Domisili (Kecamatan/Kota)</label>
                  <input type="text" style={inputStyle} value={domicile} onChange={e => setDomicile(e.target.value)} required placeholder="Kebayoran Baru, Jakarta Selatan" />
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '1rem', color: '#6ee7b7', fontSize: '0.875rem' }}>
                  <CheckCircle size={16} /> Akun langsung aktif setelah daftar
                </div>
              </>
            )}

            {targetRole === 'MITRA_B2B' && (
              <>
                <label style={labelStyle}>Tipe Industri</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  <div onClick={() => setIndustryType('INDUSTRI')} style={{ border: `2px solid ${industryType === 'INDUSTRI' ? '#10B981' : 'rgba(255,255,255,0.2)'}`, background: industryType === 'INDUSTRI' ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', cursor: 'pointer' }}>
                    <div style={{ fontWeight: 700, color: 'white', marginBottom: '4px' }}>🏭 Industri</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Perusahaan atau pabrik daur ulang</div>
                  </div>
                  <div onClick={() => setIndustryType('PENGRAJIN')} style={{ border: `2px solid ${industryType === 'PENGRAJIN' ? '#10B981' : 'rgba(255,255,255,0.2)'}`, background: industryType === 'PENGRAJIN' ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', cursor: 'pointer' }}>
                    <div style={{ fontWeight: 700, color: 'white', marginBottom: '4px' }}>🎨 Pengrajin</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Pembuat produk kreatif dari bahan daur ulang</div>
                  </div>
                  <div onClick={() => setIndustryType('PELAJAR')} style={{ border: `2px solid ${industryType === 'PELAJAR' ? '#10B981' : 'rgba(255,255,255,0.2)'}`, background: industryType === 'PELAJAR' ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', cursor: 'pointer' }}>
                    <div style={{ fontWeight: 700, color: 'white', marginBottom: '4px' }}>🎓 Pelajar</div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Peneliti atau pelajar yang membutuhkan bahan</div>
                  </div>
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <label style={labelStyle}>Alamat Perusahaan/Studio</label>
                  <textarea style={{...inputStyle, minHeight: '80px'}} value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} required />
                </div>
                <div>
                  <label style={labelStyle}>Kode Pos</label>
                  <input type="number" style={inputStyle} value={companyPostalCode} onChange={e => setCompanyPostalCode(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '1rem', color: '#6ee7b7', fontSize: '0.875rem' }}>
                  <CheckCircle size={16} /> Akun langsung aktif setelah daftar
                </div>
              </>
            )}

            {targetRole === 'ADMIN_TPS3R' && (
              <>
                <div>
                  <label style={labelStyle}>Nama TPS3R</label>
                  <input type="text" style={inputStyle} value={tpsName} onChange={e => setTpsName(e.target.value)} required placeholder="TPS3R Mawar Berseri" />
                </div>
                <div>
                  <label style={labelStyle}>Alamat TPS3R</label>
                  <textarea style={{...inputStyle, minHeight: '80px'}} value={tpsAddress} onChange={e => setTpsAddress(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '12px', marginTop: '1rem' }}>
                  <Info size={20} color="#fbbf24" style={{ flexShrink: 0 }} />
                  <p style={{ margin: 0, color: '#fcd34d', fontSize: '0.875rem', lineHeight: 1.5 }}>
                    ⏳ Akun akan diverifikasi oleh tim e-TrashHub dalam 1×24 jam sebelum dapat digunakan.
                  </p>
                </div>
              </>
            )}

            {targetRole === 'PEMDA' && (
              <>
                <div>
                  <label style={labelStyle}>Kabupaten/Kota</label>
                  <input type="text" style={inputStyle} value={region} onChange={e => setRegion(e.target.value)} required placeholder="Kota Bandung" />
                </div>
                <div>
                  <label style={labelStyle}>Alamat Kantor Dinas</label>
                  <textarea style={{...inputStyle, minHeight: '80px'}} value={officeAddress} onChange={e => setOfficeAddress(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '12px', marginTop: '1rem' }}>
                  <Info size={20} color="#fbbf24" style={{ flexShrink: 0 }} />
                  <p style={{ margin: 0, color: '#fcd34d', fontSize: '0.875rem', lineHeight: 1.5 }}>
                    ⏳ Akun akan diverifikasi oleh tim e-TrashHub dalam 1×24 jam sebelum dapat digunakan.
                  </p>
                </div>
              </>
            )}
            
            <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '1rem', padding: '14px', background: '#10B981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Memproses...' : 'Selesaikan Pendaftaran'}
            </button>
          </form>
        )}

        {/* TODO: RESTORE AUTH — login link dinonaktifkan sementara
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>
            Sudah punya akun?{' '}
            <button 
              type="button"
              onClick={() => navigate(`/login${targetRole ? `?role=${targetRole}` : ''}`)}
              style={{ background: 'none', border: 'none', color: '#34d399', fontWeight: 600, cursor: 'pointer', padding: 0 }}
            >
              Masuk di sini
            </button>
          </div>
        </div>
        */}
      </div>
    </div>
  );
}
