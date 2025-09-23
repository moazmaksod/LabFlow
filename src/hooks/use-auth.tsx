
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/lib/schemas/auth';
import { useRouter } from 'next/navigation';

const AUTH_STORAGE_KEY = 'labflow.auth.user';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to parse user from session storage', error);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
