import { createContext, useState, useEffect, useCallback, useContext } from "react";
import { useAuth } from "./AuthContext";

const IDLE_TIMEOUT = 60 * 60 * 1000; // 1 hour

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const { logout } = useAuth();
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

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

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > IDLE_TIMEOUT) {
        setIsSessionExpired(true);
        logout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastActivity, logout]);

  return (
    <SessionContext.Provider value={{ isSessionExpired, setIsSessionExpired }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionManager = () => useContext(SessionContext);
