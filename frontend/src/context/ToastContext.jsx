import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: "fixed", bottom: 16, right: 16, display: "grid", gap: 8, zIndex: 100 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            background: "#111827", color: "white", padding: "0.75rem 1rem",
            borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.2)", maxWidth: 320,
          }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);