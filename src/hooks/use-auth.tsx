
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/lib/schemas/auth';
import { UserSchema } from '@/lib/schemas/auth';
import { useRouter } from 'next/navigation';

const AUTH_STORAGE_KEY = 'labflow.auth.token';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => User | null;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedToken = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (storedToken) {
        // In a real app, you'd verify the token with a backend.
        // For this prototype, we decode it.
        const decodedUser = JSON.parse(Buffer.from(storedToken, 'base64').toString('utf-8'));
        const validatedUser = UserSchema.safeParse(decodedUser);
        if (validatedUser.success) {
            setUser(validatedUser.data);
            setToken(storedToken);
        } else {
            // Token is invalid or malformed
            sessionStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to parse token from session storage', error);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setLoading(false);
  }, []);

  const login = (newToken: string): User | null => {
    try {
      sessionStorage.setItem(AUTH_STORAGE_KEY, newToken);
      const decodedUser = JSON.parse(Buffer.from(newToken, 'base64').toString('utf-8'));
      console.log('[useAuth] Decoded user from token:', decodedUser);
      const validatedUser = UserSchema.safeParse(decodedUser);
      if (validatedUser.success) {
        setUser(validatedUser.data);
        setToken(newToken);
        return validatedUser.data;
      }
    } catch (error) {
        console.error('Failed to decode or validate token', error);
    }
    // If we get here, something went wrong.
    logout();
    return null;
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
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
