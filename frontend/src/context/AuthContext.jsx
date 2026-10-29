import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import socket from "../services/socket";
import { useToast } from "./ToastContext";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api.get("/auth/me")
      .then((res) => {
        setUser(res.data.data.user);
        socket.connect();
        socket.emit("join:user", res.data.data.user._id);
      })
      .catch(() => { localStorage.removeItem("token"); setToken(null); })
      .finally(() => setLoading(false));
  }, [token]);

  // ONE global listener, always active for the whole app while logged in —
  // regardless of which page is currently rendered.
  useEffect(() => {
    if (!user) return;
    const handleNotification = (notification) => showToast(notification.message);
    socket.on("notification:new", handleNotification);
    return () => socket.off("notification:new", handleNotification);
  }, [user]);

  const login = (newToken, newUser) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
    socket.connect();
    socket.emit("join:user", newUser._id);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    socket.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);