import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { fetchCsrfToken, getMe, login as apiLogin, logout as apiLogout, setAccessToken } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bootstrap = useCallback(async () => {
    try {
      await fetchCsrfToken();
      const me = await getMe();
      setUser(me);
    } catch (err) {
      // Non-fatal during bootstrap
      console.error('Bootstrap auth error:', err?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = async (email, password) => {
    setError(null);
    try {
      await fetchCsrfToken();
      const res = await apiLogin(email, password);
      const token = res?.data?.token || res?.token;
      if (token) setAccessToken(token);
      const me = await getMe();
      setUser(me);
      return res;
    } catch (err) {
      setError(err?.message || 'Erreur de connexion');
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await fetchCsrfToken();
      await apiLogout();
      setAccessToken(null);
      setUser(null);
    } catch (err) {
      setError(err?.message || 'Erreur de déconnexion');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};