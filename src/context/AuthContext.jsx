// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { decodeToken, isTokenExpired } from './tokenUtils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');

    if (savedToken) {
      if (isTokenExpired(savedToken)) {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      } else {
        setToken(savedToken);
        setUser(decodeToken(savedToken));
      }
    }

    setIsLoading(false);

    // Logout in all tabs when one tab logs out or clears the token
    const onStorage = (event) => {
      if (event.key !== 'authToken') return;
      if (event.newValue) {
        setToken(event.newValue);
        setUser(decodeToken(event.newValue));
      } else {
        setToken(null);
        setUser(null);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Login function - hanya terima token
  const login = async (newToken) => {
    try {
      // Check if token is valid
      if (isTokenExpired(newToken)) {
        throw new Error('Token is expired');
      }

      // Simpan token ke localStorage
      localStorage.setItem('authToken', newToken);
      
      // Update state
      setToken(newToken);
      
      // Decode user info from token
      const userInfo = decodeToken(newToken);
      setUser(userInfo);
      
      return userInfo; // Return user info for role-based redirect
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    // Hapus token dari localStorage
    localStorage.removeItem('authToken');
    
    // Clear state
    setToken(null);
    setUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = !!token && !isTokenExpired(token);

  const value = {
    token,
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};