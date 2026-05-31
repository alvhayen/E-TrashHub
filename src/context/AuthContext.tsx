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

  const login = (newToken: string, newUser: any) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    
    // Normalize role and status if they come directly from register/login API
    if (newUser.role && newUser.role === newUser.role.toUpperCase()) {
      setUser({
        ...newUser,
        role: newUser.role.toLowerCase(),
        status: newUser.verificationStatus === 'ACTIVE' ? 'active' : 'pending'
      });
    } else {
      setUser(newUser);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    window.location.href = '/';
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedData = { ...data };
      if (updatedData.role && typeof updatedData.role === 'string') {
        updatedData.role = updatedData.role.toLowerCase() as any;
      }
      setUser({ ...user, ...updatedData });
    }
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
