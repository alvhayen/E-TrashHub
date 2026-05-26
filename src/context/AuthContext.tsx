// TODO: RESTORE AUTH — AuthContext di-mock sementara untuk debug
// Original file used JWT token from localStorage and verified via /api/auth/me
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USERS: Record<string, User> = {
  RUMAH_TANGGA: { id: 1,  name: 'Sari Dewi',      email: 'sari@email.com',          role: 'rumah_tangga' as Role, status: 'active', address: 'Jl. Mawar No. 10', phone: '081234567890', points: 1250 },
  DRIVER:       { id: 2,  name: 'Budi Santoso',    email: 'budi.driver@email.com',   role: 'driver' as Role,       status: 'active', address: 'Jl. Kenanga No. 5',  phone: '081234567891', points: 0 },
  ADMIN_TPS3R:  { id: 3,  name: 'Admin TPS3R',     email: 'admin.tps3r@email.com',   role: 'admin_tps3r' as Role,  status: 'active', address: 'Jl. TPS3R Mawar',    phone: '081234567892', points: 0, tps3r_id: 1, tps3r_name: 'TPS3R Mawar' },
  MITRA_B2B:    { id: 4,  name: 'Mitra Industri',  email: 'mitra@industri.com',      role: 'mitra_b2b' as Role,    status: 'active', address: 'Jl. Industri No. 1', phone: '081234567893', points: 0 },
  PEMDA:        { id: 5,  name: 'Dinas Surabaya',  email: 'dinas@surabaya.go.id',    role: 'pemda' as Role,        status: 'active', address: 'Jl. Pemkot No. 1',   phone: '081234567894', points: 0 },
  SUPER_ADMIN:  { id: 6,  name: 'Super Admin',     email: 'superadmin@etrashhub.id', role: 'super_admin' as Role,  status: 'active', address: '',                    phone: '',             points: 0 },
};

// TODO: RESTORE AUTH — Ganti key ini untuk berpindah role saat development:
function getActiveMockRole(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('dev_mock_role') || 'RUMAH_TANGGA';
  }
  return 'RUMAH_TANGGA';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(MOCK_USERS[getActiveMockRole()] || MOCK_USERS['RUMAH_TANGGA']);
  const token = 'mock-token-bypass';

  const login = (newToken: string, newUser: User) => {
    // TODO: RESTORE AUTH — restore localStorage token handling
    setUser(newUser);
  };

  const logout = () => {
    // TODO: RESTORE AUTH — restore localStorage cleanup and redirect
    console.log('[AUTH BYPASS] logout() called — no-op in debug mode');
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
