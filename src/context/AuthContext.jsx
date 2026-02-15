import React, { useState } from 'react';
import { apiFetch } from '../utils/api';
import { AuthContext } from './authContextRoot.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem('user');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem('token'); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const login = async (credentials) => {
    const path = 'auth/vet/login';
    setLoading(true);
    try {
      const { ok, status, data } = await apiFetch(path, { method: 'POST', body: credentials });
      setLoading(false);
      if (!ok) return { ok, status, data };
      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }
      return { ok: true, data };
    } catch (e) {
      setLoading(false);
      return { ok: false, error: e };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    // navigate to login via full reload to reset history
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth hook moved to `src/context/useAuth.js` to keep this file exporting only
// React components which is required for fast-refresh.
