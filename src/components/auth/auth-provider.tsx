'use client';

import type { User, Role } from '@/lib/types';
import { users } from '@/lib/data';
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Could not parse user from localStorage", error);
      localStorage.removeItem('currentUser');
    }
  }, []);

  const login = useCallback((role: Role) => {
    const userToLogin = users.find((u) => u.role === role);
    if (userToLogin) {
      localStorage.setItem('currentUser', JSON.stringify(userToLogin));
      setUser(userToLogin);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('currentUser');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
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
