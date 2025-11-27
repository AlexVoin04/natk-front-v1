// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { getStoredToken, setStoredToken } from '../api/api';
import { parseJwt } from '../utils/jwt';
import type { ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email?: string;
  surname?: string;
}

interface AuthContextType {
  user: User | null;
  login: (login: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    surname: string,
    patronymic: string | null,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const TOKEN_KEY = 'access_token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  function applyToken(t: string | null) {
    setToken(t);
    setStoredToken(t);
    if (t) {
      const payload = parseJwt(t);
      if (payload) {
        setUser({
          id: payload.sub ?? '',
          name: `${payload.name ?? ''} ${payload.surname ?? ''}`.trim() || 'User',
          email: payload.email ?? undefined,
          surname: payload.surname ?? undefined,
        });
      } else {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }

  useEffect(() => {
    // при монтировании читаем token из localStorage и заполняем user
    const t = getStoredToken();
    if (t) applyToken(t);
    setIsLoading(false);
  }, []);

  const login = async (login: string, password: string) => {
    setIsLoading(true);
    try {
      const resp = await api.post('/auth/login', {
        login: login,
        password: password,
      });
      const newToken = resp.data?.token || resp.data?.accessToken;
      if (!newToken) throw new Error('No token in response');
      applyToken(newToken);
      setIsLoading(false);
      return true;
    } catch (err) {
      applyToken(null);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (
    name: string,
    surname: string,
    patronymic: string | null,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // backend expects login (we will use email as login). Also roles required in your service.
      await api.post('/auth/register', {
        login: email,
        password,
        name,
        surname,       // optional fields - adjust form to include surname if needed
        patronymic,
        roles: ['TEACHER'] // change as needed
      });
      // After successful register — optionally auto-login:
      const logged = await login(email, password);
      setIsLoading(false);
      return { success: logged };
    } catch (err: any) {
      setIsLoading(false);
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed";

    return { success: false, error: serverMessage };
    }
  };

  const logout = () => {
    applyToken(null);
    // возможно, вызов на бэкенд для invalidate — если реализуете
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
