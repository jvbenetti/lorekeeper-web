'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { apiFetch, TOKEN_STORAGE_KEY } from '@/lib/api';
import type { LoginRequest, LoginResponse } from '@/types/api';

interface AuthContextType {
  token: string | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  setTokenManually: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const data = await apiFetch<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    window.localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    setToken(data.token);
  }, []);

  const setTokenManually = useCallback((newToken: string) => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        isAdmin: Boolean(token),
        isLoading,
        login,
        setTokenManually,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
