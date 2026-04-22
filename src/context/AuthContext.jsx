import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI, setAccessToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from Refresh Token on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Attempt to get a new access token using the HttpOnly Refresh Cookie
        const { data } = await authAPI.refreshToken();
        if (data.success) {
          setAccessToken(data.accessToken);
          setUser(data.user);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch (error) {
        // No valid session on mount - clear local state
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();

    // Listen for token expiry events from API interceptor
    const handleExpiry = () => forceLogout();
    window.addEventListener('auth:expired', handleExpiry);
    return () => window.removeEventListener('auth:expired', handleExpiry);
  }, []);

  const login = useCallback((userData, token) => {
    setAccessToken(token);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const forceLogout = useCallback(() => {
    setAccessToken(null);
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // silent
    } finally {
      forceLogout();
    }
  }, [forceLogout]);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
