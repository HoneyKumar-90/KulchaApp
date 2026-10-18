import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setToken } from './api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('auth');
        if (raw) {
          const saved = JSON.parse(raw);
          if (new Date(saved.expiresAt) > new Date()) {
            setToken(saved.token);
            setUser(saved);
          } else {
            await AsyncStorage.removeItem('auth');
          }
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const persist = async (res) => {
    setToken(res.token);
    setUser(res);
    await AsyncStorage.setItem('auth', JSON.stringify(res));
  };

  const login = async (email, password) => persist(await api.login(email, password));
  const register = async (name, phone, email, password) =>
    persist(await api.register(name, phone, email, password));
  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
