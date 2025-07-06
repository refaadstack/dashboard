// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to decode JWT token (optional)
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    
    if (savedToken) {
      // Check if token is expired
      if (isTokenExpired(savedToken)) {
        // Token expired, clear it
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      } else {
        // Token valid, set it and decode user info
        setToken(savedToken);
        const userInfo = decodeToken(savedToken);
        setUser(userInfo);
      }
    }
    
    setIsLoading(false);
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