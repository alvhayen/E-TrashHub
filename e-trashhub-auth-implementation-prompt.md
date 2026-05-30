# 🔐 Prompt Implementasi Authentication — e-TrashHub
## Hybrid Auth: Google OAuth + Email/Password
## Berdasarkan audit kode aktual repository

> Kirim ke AI Agent (Claude Sonnet/Opus di Antigravity) sebagai satu prompt.
> Agent harus baca dan modifikasi file yang sudah ada — BUKAN membuat ulang dari nol.

---

## KONTEKS KODE YANG SUDAH ADA

Sebelum mengerjakan, pahami kondisi aktual codebase:

**Yang sudah ada dan JANGAN diubah strukturnya:**
- `src/pages/auth/Login.tsx` — UI login sudah ada (dark theme, LeafNetworkBg)
- `src/pages/auth/Register.tsx` — UI register multi-step per role sudah ada
- `src/pages/auth/PendingVerification.tsx` — halaman pending sudah ada
- `backend/src/controllers/auth.controller.js` — logic register/login sudah lengkap
- `backend/prisma/schema.prisma` — schema User sudah punya semua field yang dibutuhkan

**Yang perlu DIAKTIFKAN kembali (saat ini di-bypass):**
- `backend/src/routes/auth.routes.js` — semua route di-stub, perlu restore ke controller asli
- `src/context/AuthContext.tsx` — masih mock statis, perlu restore ke JWT real
- `src/hooks/useApi.ts` — masih pakai x-mock-role header, perlu restore ke Bearer token
- `src/main.tsx` — interceptor axios masih inject x-mock-role
- `src/components/ProtectedRoute.tsx` — masih bypass semua check
- `src/App.tsx` — route login/register masih di-comment

**Yang perlu DITAMBAHKAN (baru):**
- Tombol "Masuk dengan Google" di Login.tsx dan Register.tsx
- Backend endpoint untuk Google OAuth callback
- `src/pages/auth/CompleteProfile.tsx` — halaman baru untuk lengkapi profil setelah Google OAuth

---

## DESAIN AUTH YANG DIMINTA

Referensi visual: dark card terpusat, background gelap, tombol Google di atas, divider "ATAU", lalu form email + password.

**USER FLOW LENGKAP:**

```
FLOW A — Google OAuth:
Klik "Masuk dengan Google"
  → Popup Google OAuth (window.open)
  → User pilih akun Google
  → Backend terima callback, cari/buat user berdasarkan email Google
  → Jika user BARU: redirect ke /auth/complete-profile?token=xxx (isi role + data tambahan)
  → Jika user LAMA & ACTIVE: JWT dibuat, redirect ke dashboard sesuai role
  → Jika user LAMA & PENDING: redirect ke /auth/pending-verification

FLOW B — Email/Password Login:
Isi email + password → POST /api/auth/login
  → Jika ACTIVE: JWT → dashboard
  → Jika PENDING: /auth/pending-verification
  → Jika REJECTED: tampilkan pesan error + catatan

FLOW C — Register Manual:
Pilih role di /roles → /role-onboarding/:roleId → klik "Daftar" → /auth/register/:role
  → Isi form 2 langkah → POST /api/auth/register
  → Jika ACTIVE (RT/Driver/Mitra): auto-login → dashboard
  → Jika PENDING (TPS3R/Pemda): /auth/pending-verification
```

---

## BAGIAN 1 — BACKEND

### FILE 1: `backend/src/controllers/auth.controller.js`
**Aksi: TAMBAHKAN fungsi-fungsi baru di bawah yang sudah ada. Jangan ubah fungsi existing.**

Tambahkan di bagian bawah file, sebelum export terakhir:

```javascript
// ─── GOOGLE OAUTH ───────────────────────────────────────

// Step 1: Generate Google OAuth URL
export const getGoogleAuthUrl = (req, res) => {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ success: true, url: authUrl });
};

// Step 2: Handle Google OAuth callback
export const handleGoogleCallback = async (req, res) => {
  const { code } = req.query;
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
  const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';

  if (!code) {
    return res.redirect(`${FRONTEND_URL}/auth/login?error=oauth_cancelled`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      console.error('Google token exchange error:', tokenData);
      return res.redirect(`${FRONTEND_URL}/auth/login?error=oauth_failed`);
    }

    // Get user info from Google
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userInfoRes.json();

    // Find existing user by email
    let user = await prisma.user.findUnique({ where: { email: googleUser.email } });

    if (user) {
      // Existing user — check status
      if (user.verificationStatus === 'PENDING') {
        return res.redirect(`${FRONTEND_URL}/auth/pending-verification`);
      }
      if (user.verificationStatus === 'REJECTED') {
        return res.redirect(`${FRONTEND_URL}/auth/login?error=rejected`);
      }

      // Generate JWT for existing active user
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name, driverType: user.driverType, verificationStatus: user.verificationStatus },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token (frontend will store it)
      return res.redirect(`${FRONTEND_URL}/auth/oauth-callback?token=${token}&status=existing`);
    } else {
      // New user — create a temporary pre-auth token (no role yet)
      // This token only contains Google profile info, valid 15 minutes
      const preAuthToken = jwt.sign(
        { googleEmail: googleUser.email, googleName: googleUser.name, isPreAuth: true },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      // Redirect to complete-profile page with pre-auth token
      return res.redirect(`${FRONTEND_URL}/auth/complete-profile?token=${preAuthToken}`);
    }
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    return res.redirect(`${FRONTEND_URL}/auth/login?error=server_error`);
  }
};

// Step 3: Complete profile after Google OAuth (for new users)
export const completeGoogleProfile = async (req, res) => {
  try {
    const { preAuthToken, role, ...profileData } = req.body;

    // Verify pre-auth token
    let decoded;
    try {
      decoded = jwt.verify(preAuthToken, JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Token tidak valid atau sudah kedaluwarsa. Silakan login ulang dengan Google.' });
    }

    if (!decoded.isPreAuth) {
      return res.status(401).json({ error: 'Token tidak valid.' });
    }

    if (!role || role === 'SUPER_ADMIN') {
      return res.status(400).json({ error: 'Role tidak valid.' });
    }

    // Check email not already taken
    const existing = await prisma.user.findUnique({ where: { email: decoded.googleEmail } });
    if (existing) {
      // Race condition: user registered between oauth init and complete
      const token = jwt.sign(
        { id: existing.id, email: existing.email, role: existing.role, name: existing.name, driverType: existing.driverType, verificationStatus: existing.verificationStatus },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({ success: true, token, user: { id: existing.id, email: existing.email, role: existing.role, name: existing.name, verificationStatus: existing.verificationStatus } });
    }

    // Build userData berdasarkan role (sama persis seperti register manual)
    let userData = {
      email: decoded.googleEmail,
      name: profileData.name || decoded.googleName,
      role,
      phone: profileData.phone || null,
      password: await bcrypt.hash(Math.random().toString(36) + Date.now(), 10), // random password (user login via Google)
      verificationStatus: 'ACTIVE',
    };

    let requiresVerification = false;

    if (role === 'RUMAH_TANGGA') {
      userData = { ...userData, houseRole: profileData.houseRole, address: profileData.address, postalCode: profileData.postalCode };
    } else if (role === 'DRIVER') {
      userData = { ...userData, driverType: profileData.driverType, domicile: profileData.domicile };
    } else if (role === 'MITRA_B2B') {
      userData = { ...userData, industryType: profileData.industryType, companyAddress: profileData.companyAddress, companyPostalCode: profileData.companyPostalCode };
    } else if (role === 'ADMIN_TPS3R') {
      userData = { ...userData, tpsName: profileData.tpsName, tpsAddress: profileData.tpsAddress, verificationStatus: 'PENDING' };
      requiresVerification = true;
    } else if (role === 'PEMDA') {
      userData = { ...userData, region: profileData.region, officeAddress: profileData.officeAddress, verificationStatus: 'PENDING' };
      requiresVerification = true;
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: userData });
      if (requiresVerification) {
        await tx.verificationQueue.create({ data: { userId: user.id, role: user.role, status: 'PENDING' } });
      }
      return user;
    });

    if (requiresVerification) {
      return res.status(201).json({ success: true, requiresVerification: true });
    }

    const token = jwt.sign(
      { id: result.id, email: result.email, role: result.role, name: result.name, driverType: result.driverType, verificationStatus: result.verificationStatus },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: { id: result.id, email: result.email, role: result.role, name: result.name, verificationStatus: result.verificationStatus }
    });
  } catch (err) {
    console.error('completeGoogleProfile error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
```

### FILE 2: `backend/src/routes/auth.routes.js`
**Aksi: GANTI SELURUH ISI FILE dengan versi yang restore controller asli + tambah Google routes.**

```javascript
import express from 'express';
import { register, login, getMe, getLeaderboard, updateProfile, claimBonus, getGoogleAuthUrl, handleGoogleCallback, completeGoogleProfile } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// ─── EMAIL/PASSWORD AUTH ───────────────────────────────
router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);
router.post('/claim-bonus', verifyToken, claimBonus);
router.get('/leaderboard', getLeaderboard);

// ─── GOOGLE OAUTH ──────────────────────────────────────
router.get('/google', getGoogleAuthUrl);
router.get('/google/callback', handleGoogleCallback);
router.post('/google/complete', completeGoogleProfile);

export default router;
```

### FILE 3: `backend/src/middleware/auth.js`
**Aksi: RESTORE ke versi JWT yang sesungguhnya. Ganti seluruh isi file.**

```javascript
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-etrashhub';

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, code: 'NO_TOKEN', error: 'Token tidak ditemukan. Silakan login.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, code: 'TOKEN_EXPIRED', error: 'Sesi telah berakhir. Silakan login kembali.' });
    }
    return res.status(401).json({ success: false, code: 'INVALID_TOKEN', error: 'Token tidak valid.' });
  }
};

export const authorizeRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Tidak terautentikasi.' });
  }
  const userRole = req.user.role?.toUpperCase();
  const allowedRoles = roles.map(r => r.toUpperCase());
  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ success: false, code: 'FORBIDDEN', error: `Akses ditolak. Role ${userRole} tidak diizinkan.` });
  }
  next();
};

export const checkActiveStatus = async (req, res, next) => {
  if (!req.user) return next();
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { verificationStatus: true }
    });
    if (!user) return res.status(401).json({ success: false, error: 'User tidak ditemukan.' });
    if (user.verificationStatus === 'PENDING') {
      return res.status(403).json({ success: false, code: 'PENDING_VERIFICATION', error: 'Akun sedang dalam proses verifikasi.' });
    }
    if (user.verificationStatus === 'REJECTED') {
      return res.status(403).json({ success: false, code: 'REJECTED', error: 'Akun ditolak.' });
    }
    next();
  } catch (err) {
    next(err);
  }
};
```

### FILE 4: `backend/.env.example`
**Aksi: TAMBAHKAN variable Google OAuth.**

Tambahkan baris berikut:
```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
JWT_SECRET=ganti-dengan-secret-yang-kuat-minimal-32-karakter
```

---

## BAGIAN 2 — FRONTEND

### FILE 5: `src/context/AuthContext.tsx`
**Aksi: GANTI SELURUH ISI FILE. Restore ke JWT real + hapus semua mock.**

```tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'etrashhub_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setLoading(false);
      return;
    }

    axios.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${storedToken}` }
    })
      .then(res => {
        const userData = res.data.user;
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role.toLowerCase() as any,
          status: userData.verificationStatus === 'ACTIVE' ? 'active' : 'pending',
          address: userData.address,
          phone: userData.phone,
          points: userData.points,
          driverType: userData.driverType,
          tps3r_name: userData.tpsName,
        });
        setToken(storedToken);
      })
      .catch(() => {
        // Token invalid/expired — clear it
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    if (user) setUser({ ...user, ...data });
  };

  return (
    <AuthContext.Provider value={{
      user, token,
      isAuthenticated: !!user && !!token,
      loading, login, logout, updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
```

### FILE 6: `src/hooks/useApi.ts`
**Aksi: GANTI SELURUH ISI. Restore ke Bearer token, hapus x-mock-role.**

```typescript
import { useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';

export function useApi() {
  const { token, logout } = useAuth();
  const { error: showErrorToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<{ method: string; url: string; data?: any } | null>(null);

  const request = useCallback(async (method: string, url: string, reqData?: any, attempt = 1): Promise<any> => {
    setLoading(true);
    setError(null);
    setLastRequest({ method, url, data: reqData });

    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await axios({ method, url, data: reqData, headers });
      setLoading(false);
      setData(response.data);
      return response.data;
    } catch (err: any) {
      // Auto-retry once on 5xx or network error
      if (attempt === 1 && (!err.response || err.response.status >= 500)) {
        return request(method, url, reqData, 2);
      }

      setLoading(false);
      const errMsg = err.response?.data?.error || err.message || 'Terjadi kesalahan.';
      setError(errMsg);

      if (err.response?.status === 401) {
        showErrorToast('Sesi Anda telah berakhir. Silakan login kembali.');
        logout();
      } else {
        showErrorToast(errMsg);
      }

      throw err;
    }
  }, [token, logout, showErrorToast]);

  const refetch = useCallback(() => {
    if (lastRequest) return request(lastRequest.method, lastRequest.url, lastRequest.data);
    return Promise.resolve(null);
  }, [lastRequest, request]);

  return { data, request, loading, error, refetch };
}
```

### FILE 7: `src/main.tsx`
**Aksi: HAPUS interceptor axios x-mock-role. Ganti seluruh isi.**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

### FILE 8: `src/components/ProtectedRoute.tsx`
**Aksi: RESTORE logika auth check yang sesungguhnya.**

```tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const ROLE_DASHBOARDS: Record<string, string> = {
  rumah_tangga: '/household',
  driver: '/driver',
  admin_tps3r: '/admin',
  mitra_b2b: '/mitra',
  pemda: '/pemda',
  super_admin: '/superadmin',
};

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a2318' }}>
        <div style={{ color: '#4ade80', fontSize: '1rem', fontWeight: 600 }}>Memuat...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  if (user?.status === 'pending') {
    return <Navigate to="/auth/pending-verification" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to user's own dashboard instead of /unauthorized
    const userDashboard = ROLE_DASHBOARDS[user.role] || '/';
    return <Navigate to={userDashboard} replace />;
  }

  return <>{children}</>;
}
```

### FILE 9: `src/types/index.ts`
**Aksi: GANTI SELURUH ISI. Standarisasi role ke lowercase (sesuai yang sudah dipakai di frontend).**

```typescript
// Role di frontend menggunakan lowercase (sesuai yang disimpan di AuthContext)
// Role di backend menggunakan UPPERCASE (sesuai yang disimpan di database)
// Mapping terjadi di AuthContext saat login

export type Role = 'rumah_tangga' | 'driver' | 'admin_tps3r' | 'mitra_b2b' | 'pemda' | 'super_admin';

export type AccountStatus = 'active' | 'pending' | 'rejected';

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  status: AccountStatus;
  address?: string;
  phone?: string;
  points?: number;
  tps3r_id?: number;
  tps3r_name?: string;
  driverType?: 'MITRA_TPS3R' | 'FREELANCE' | string;
  domicile?: string;
  region?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}
```

### FILE 10: `src/pages/auth/Login.tsx`
**Aksi: TAMBAHKAN tombol Google OAuth di atas form yang sudah ada. Pertahankan semua kode existing.**

Tambahkan state dan handler Google OAuth, lalu sisipkan tombol di antara header dan form:

```tsx
// Tambahkan import ini di bagian atas (setelah import yang ada):
// import { Chrome } from 'lucide-react'; // tidak perlu, gunakan SVG inline

// Tambahkan state ini di dalam komponen Login, setelah state yang sudah ada:
const [googleLoading, setGoogleLoading] = useState(false);
const [showEyePassword, setShowEyePassword] = useState(false);

// Tambahkan handler ini sebelum return:
const handleGoogleLogin = async () => {
  setGoogleLoading(true);
  try {
    const res = await axios.get('/api/auth/google');
    if (res.data.url) {
      // Redirect langsung (bukan popup) — lebih reliable di mobile
      window.location.href = res.data.url;
    }
  } catch {
    setError('Gagal menghubungi server. Coba lagi.');
    setGoogleLoading(false);
  }
};

// Di dalam return, TEPAT SETELAH blok error (sebelum <form>), tambahkan:
{/* Tombol Google */}
<button
  type="button"
  onClick={handleGoogleLogin}
  disabled={googleLoading}
  style={{
    width: '100%',
    padding: '13px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.07)',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: googleLoading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '1.5rem',
    opacity: googleLoading ? 0.7 : 1,
    transition: 'background 0.2s',
  }}
>
  {/* Google G logo SVG */}
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
  {googleLoading ? 'Menghubungkan...' : 'Masuk dengan Google'}
</button>

{/* Divider ATAU */}
<div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.15)' }} />
  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.05em' }}>ATAU</span>
  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.15)' }} />
</div>

// Ganti tombol submit existing dengan versi yang punya show/hide password dan label Bahasa Indonesia:
// Di label "Email Address" → ganti ke "Email"
// Di label "Password" → pertahankan
// Di tombol submit → ganti teks "Sign In" ke "Masuk"
// Di link "Daftar di sini" → aktifkan kembali (hapus comment jika ada)
```

### FILE 11: `src/pages/auth/Register.tsx`
**Aksi: TAMBAHKAN tombol Google di Step 1. Pertahankan semua form existing.**

Di dalam form Step 1 (`step === 1`), SEBELUM form tag, tambahkan:

```tsx
// Tambahkan state:
const [googleLoading, setGoogleLoading] = useState(false);

// Tambahkan handler:
const handleGoogleRegister = async () => {
  setGoogleLoading(true);
  try {
    const res = await axios.get('/api/auth/google');
    if (res.data.url) {
      // Simpan role yang dipilih di sessionStorage agar bisa dipakai di complete-profile
      sessionStorage.setItem('pending_role', targetRole);
      window.location.href = res.data.url;
    }
  } catch {
    setError('Gagal menghubungi server. Coba lagi.');
    setGoogleLoading(false);
  }
};

// Di JSX step === 1, SEBELUM form, tambahkan:
{/* Google Register Button */}
<button
  type="button"
  onClick={handleGoogleRegister}
  disabled={googleLoading}
  style={{
    width: '100%', padding: '13px 16px', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.07)',
    color: '#ffffff', fontWeight: 600, fontSize: '0.95rem',
    cursor: googleLoading ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    marginBottom: '1.5rem', opacity: googleLoading ? 0.7 : 1,
  }}
>
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
  {googleLoading ? 'Menghubungkan...' : 'Daftar dengan Google'}
</button>

<div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.15)' }} />
  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 500 }}>ATAU ISI MANUAL</span>
  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.15)' }} />
</div>
```

### FILE 12: `src/pages/auth/OAuthCallback.tsx` *(FILE BARU)*
**Aksi: BUAT FILE BARU. Halaman ini memproses redirect dari Google OAuth.**

```tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LeafNetworkBg from '../../components/backgrounds/LeafNetworkBg';
import axios from 'axios';

// Mapping role dari database (UPPERCASE) ke frontend (lowercase) dan ke path dashboard
const ROLE_ROUTE_MAP: Record<string, { frontendRole: any; path: string }> = {
  RUMAH_TANGGA: { frontendRole: 'rumah_tangga', path: '/household' },
  DRIVER:       { frontendRole: 'driver',        path: '/driver'    },
  ADMIN_TPS3R:  { frontendRole: 'admin_tps3r',   path: '/admin'     },
  MITRA_B2B:    { frontendRole: 'mitra_b2b',     path: '/mitra'     },
  PEMDA:        { frontendRole: 'pemda',          path: '/pemda'     },
  SUPER_ADMIN:  { frontendRole: 'super_admin',    path: '/superadmin'},
};

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const oauthStatus = searchParams.get('status');
    const error = searchParams.get('error');

    if (error) {
      const messages: Record<string, string> = {
        oauth_cancelled: 'Login Google dibatalkan.',
        oauth_failed: 'Gagal login dengan Google. Coba lagi.',
        rejected: 'Akun Anda telah ditolak. Hubungi admin.',
        server_error: 'Terjadi kesalahan server. Coba lagi.',
      };
      setErrorMsg(messages[error] || 'Terjadi kesalahan.');
      setStatus('error');
      return;
    }

    if (!token) {
      setErrorMsg('Token tidak ditemukan.');
      setStatus('error');
      return;
    }

    if (oauthStatus === 'existing') {
      // Existing user — fetch their full profile then login
      axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          const userData = res.data.user;
          const mapping = ROLE_ROUTE_MAP[userData.role] || ROLE_ROUTE_MAP['RUMAH_TANGGA'];
          login(token, {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: mapping.frontendRole,
            status: 'active',
            address: userData.address,
            phone: userData.phone,
            points: userData.points,
            driverType: userData.driverType,
            tps3r_name: userData.tpsName,
          });
          navigate(mapping.path, { replace: true });
        })
        .catch(() => {
          setErrorMsg('Gagal memuat profil. Coba login lagi.');
          setStatus('error');
        });
    }
    // Note: new users (no status param) are handled by /auth/complete-profile
  }, [searchParams, navigate, login]);

  if (status === 'error') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a2318', position: 'relative' }}>
        <LeafNetworkBg accentColor="#4ade80" opacity={0.5} />
        <div style={{ zIndex: 10, textAlign: 'center', color: '#fff', maxWidth: '360px', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Autentikasi Gagal</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>{errorMsg}</p>
          <button onClick={() => navigate('/auth/login')} style={{ padding: '12px 32px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a2318', position: 'relative' }}>
      <LeafNetworkBg accentColor="#4ade80" opacity={0.5} />
      <div style={{ zIndex: 10, textAlign: 'center', color: '#fff' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid rgba(74,222,128,0.3)', borderTopColor: '#4ade80', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ color: 'rgba(255,255,255,0.7)' }}>Memproses login...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
```

### FILE 13: `src/pages/auth/CompleteProfile.tsx` *(FILE BARU)*
**Aksi: BUAT FILE BARU. Halaman untuk user baru Google yang perlu pilih role + isi data.**

Halaman ini reuse UI dan logika yang sudah ada di `Register.tsx` (Step 2 saja).
Tidak perlu isi nama/email/password karena sudah dari Google.

```tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Leaf, ArrowLeft, Info, CheckCircle } from 'lucide-react';
import LeafNetworkBg from '../../components/backgrounds/LeafNetworkBg';

const ROLES = [
  { id: 'RUMAH_TANGGA', label: 'Rumah Tangga', icon: '🏠', desc: 'Jual sampah, dapat poin' },
  { id: 'DRIVER', label: 'Driver / Pengepul', icon: '🚛', desc: 'Jemput sampah, dapat penghasilan' },
  { id: 'MITRA_B2B', label: 'Mitra Industri', icon: '🏢', desc: 'Beli bahan baku daur ulang' },
  { id: 'ADMIN_TPS3R', label: 'Admin TPS3R', icon: '🏭', desc: 'Kelola fasilitas TPS3R' },
  { id: 'PEMDA', label: 'Pemerintah Daerah', icon: '🏛️', desc: 'Pantau analitik kota' },
];

const ROLE_ROUTE_MAP: Record<string, string> = {
  RUMAH_TANGGA: '/household', DRIVER: '/driver', ADMIN_TPS3R: '/admin',
  MITRA_B2B: '/mitra', PEMDA: '/pemda',
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
    else if (selectedRole === 'MITRA_B2B') Object.assign(payload, { industryType, companyAddress, companyPostalCode });
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
                {[{v:'FREELANCE',label:'🚛 Freelance',desc:'Terima order dari siapapun'},{v:'MITRA_TPS3R',label:'🤝 Mitra TPS3R',desc:'Terikat dengan TPS3R tertentu'}].map(opt => (
                  <div key={opt.v} onClick={() => setDriverType(opt.v)} style={{ border: `2px solid ${driverType === opt.v ? '#10B981' : 'rgba(255,255,255,0.2)'}`, background: driverType === opt.v ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px', cursor: 'pointer', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 700, color: 'white' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>{opt.desc}</div>
                  </div>
                ))}
              </div>
              <div><label style={labelStyle}>Domisili</label><input type="text" style={inputStyle} value={domicile} onChange={e => setDomicile(e.target.value)} required placeholder="Kecamatan, Kota" /></div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#6ee7b7', fontSize: '0.875rem' }}><CheckCircle size={16} /> Akun langsung aktif</div>
            </>)}

            {selectedRole === 'MITRA_B2B' && (<>
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
```

### FILE 14: `src/App.tsx`
**Aksi: AKTIFKAN kembali route auth yang di-comment + tambah route baru + tambah ProtectedRoute.**

Lakukan perubahan berikut di App.tsx:

1. **Tambah import:**
```tsx
import OAuthCallback from './pages/auth/OAuthCallback';
import CompleteProfile from './pages/auth/CompleteProfile';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PendingVerification from './pages/auth/PendingVerification';
```

2. **Aktifkan route auth (hapus comment, ganti path):**
```tsx
<Route path="/auth/login" element={<Login />} />
<Route path="/auth/register/:role" element={<Register />} />
<Route path="/auth/pending-verification" element={<PendingVerification />} />
<Route path="/auth/oauth-callback" element={<OAuthCallback />} />
<Route path="/auth/complete-profile" element={<CompleteProfile />} />
```

3. **Wrap semua protected routes dengan ProtectedRoute:**
```tsx
// Contoh untuk household:
<Route path="/household" element={
  <ProtectedRoute allowedRoles={['rumah_tangga']}>
    <HouseholdLayout />
  </ProtectedRoute>
}>
  {/* child routes tetap sama */}
</Route>

// Lakukan hal yang sama untuk /driver, /admin, /mitra, /pemda, /superadmin
// dengan allowedRoles sesuai masing-masing
```

4. **Update redirect dari RoleOnboarding** — di `RoleOnboarding.tsx`, ganti `handleStart` agar navigate ke `/auth/login?role=ROLE_ID` alih-alih mock login langsung.

5. **Update navigasi di RoleSelector** — tombol navigasi ke `/role-onboarding/:id` sudah benar, tidak perlu diubah.

6. **Hapus `<RoleSwitcher />`** dari App.tsx karena auth sudah real.

---

## BAGIAN 3 — SETUP GOOGLE OAUTH CREDENTIALS

**Instruksi untuk developer (lakukan manual, tidak bisa dilakukan AI):**

1. Buka https://console.cloud.google.com
2. Buat project baru atau pilih yang ada
3. Pergi ke **APIs & Services → Credentials**
4. Klik **Create Credentials → OAuth 2.0 Client IDs**
5. Application type: **Web application**
6. Authorized redirect URIs: tambahkan `http://localhost:3000/api/auth/google/callback`
7. Copy **Client ID** dan **Client Secret**
8. Buat file `.env` di root project (copy dari `.env.example`), isi:
   ```
   GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxx
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
   FRONTEND_URL=http://localhost:3000
   JWT_SECRET=etrashhub-super-secret-key-2025-ganti-ini
   DATABASE_URL=file:./backend/prisma/dev.db
   ```

---

## URUTAN EKSEKUSI

```
1. Modifikasi backend/src/controllers/auth.controller.js — tambah Google functions
2. Ganti backend/src/routes/auth.routes.js — restore + tambah Google routes
3. Ganti backend/src/middleware/auth.js — restore JWT real
4. Ganti src/context/AuthContext.tsx — restore JWT real
5. Ganti src/hooks/useApi.ts — restore Bearer token
6. Ganti src/main.tsx — hapus interceptor mock
7. Ganti src/components/ProtectedRoute.tsx — restore auth check
8. Update src/types/index.ts — tambah field baru
9. Update src/pages/auth/Login.tsx — tambah Google button
10. Update src/pages/auth/Register.tsx — tambah Google button
11. Buat src/pages/auth/OAuthCallback.tsx — file baru
12. Buat src/pages/auth/CompleteProfile.tsx — file baru
13. Update src/App.tsx — aktifkan route + ProtectedRoute + hapus RoleSwitcher
14. Update src/pages/RoleOnboarding.tsx — ganti handleStart ke navigate login
15. Buat file .env dengan kredensial Google OAuth (manual oleh developer)
```

---

## VERIFIKASI SETELAH SELESAI

Test setiap flow ini:

**Flow Google OAuth (existing user):**
- Login dengan Google → pilih akun yang emailnya sudah ada di DB → langsung masuk dashboard ✓

**Flow Google OAuth (new user):**
- Login dengan Google → pilih akun baru → redirect ke /auth/complete-profile → pilih role → isi data → masuk dashboard ✓

**Flow Email/Password:**
- Buka `/auth/login` → isi email `sari@email.com` + password `password123` → masuk `/household` ✓
- Isi email salah → tampil pesan error ✓

**Flow Register Manual:**
- `/roles` → pilih Rumah Tangga → `/role-onboarding/RUMAH_TANGGA` → klik "Daftar" → `/auth/register/RUMAH_TANGGA` → isi 2 step → masuk dashboard ✓

**ProtectedRoute:**
- Akses `/household` tanpa login → redirect ke `/auth/login` ✓
- Akses `/admin` dengan user role rumah_tangga → redirect ke `/household` ✓

**Pending verification:**
- Register sebagai Admin TPS3R → redirect ke `/auth/pending-verification` ✓
- Login sebagai user PENDING → redirect ke `/auth/pending-verification` ✓
