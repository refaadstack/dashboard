import { createContext, useState, useEffect, useCallback, useContext } from "react";
import { getTokenExpiry } from "./tokenUtils";
import { useAuth } from "./AuthContext";

const IDLE_TIMEOUT = 60 * 60 * 1000; // 1 hour

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const { token, logout } = useAuth();
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const resetSession = useCallback(() => {
    setIsSessionExpired(false);
    setLastActivity(Date.now());
  }, []);

  const resetTimer = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  useEffect(() => {
    const events = ["mousemove", "keydown", "scroll", "touchstart"];

    events.forEach((event) => window.addEventListener(event, resetTimer));

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [resetTimer]);

  // Timer idle: logout setelah IDLE_TIMEOUT tanpa aktivitas
  useEffect(() => {
    if (!token) return undefined;
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > IDLE_TIMEOUT) {
        setIsSessionExpired(true);
        logout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [token, lastActivity, logout]);

  // Logout otomatis saat token JWT kedaluwarsa
  useEffect(() => {
    if (!token || isSessionExpired) return undefined;
    const delay = Math.max(0, getTokenExpiry(token) - Date.now() + 1000);
    const timeout = setTimeout(() => {
      setIsSessionExpired(true);
      logout();
    }, delay);
    return () => clearTimeout(timeout);
  }, [token, isSessionExpired, logout]);

  // Sesi baru: reset flag kedaluwarsa dan timer aktivitas saat login ulang
  useEffect(() => {
    if (token) resetSession();
  }, [token, resetSession]);

  return (
    <SessionContext.Provider value={{ isSessionExpired, setIsSessionExpired }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionManager = () => useContext(SessionContext);
