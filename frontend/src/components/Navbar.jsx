import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../services/api";
import socket from "../services/socket";
import NotificationBell from "./NotificationBell";

const NAV_LINKS = {
  FARMER: [
    { to: "/farmer/dashboard", label: "Dashboard" },
    { to: "/farmer/procurement", label: "Procurement" },
  ],
  MANDI_ADMIN: [
    { to: "/admin/dashboard", label: "Schedules" },
    { to: "/admin/payments", label: "Payments" },
  ],
  GOVT_OFFICER: [{ to: "/officer/dashboard", label: "Dashboard" }],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || user.role !== "FARMER") return;

    api.get("/notifications").then((res) => {
      setUnreadCount(res.data.data.filter((n) => !n.isRead).length);
    });

    
    socket.emit("join:user", user._id);
    const handler = () => setUnreadCount((c) => c + 1);
    socket.on("notification:new", handler);
    return () => socket.off("notification:new", handler);
  }, [user]);

  if (!user) return null;

  return (
    <nav className="bg-white border-b px-6 py-3 flex justify-between items-center">
      <div className="flex items-center gap-6">
        <span className="font-bold text-green-700 text-lg">e-Mandi</span>
        {(NAV_LINKS[user.role] || []).map((l) => (
          <Link key={l.to} to={l.to} className="text-sm text-gray-600 hover:text-green-700">{l.label}</Link>
        ))}
      </div>
      <div className="flex items-center gap-4 text-sm">
        {user.role === "FARMER" && (
          <Link to="/farmer/notifications"><NotificationBell unreadCount={unreadCount} /></Link>
        )}
        <span className="text-gray-500">{user.name} · {user.role}</span>
        <button onClick={() => { logout(); navigate("/login"); }} className="text-red-600 font-medium hover:underline">
          Logout
        </button>
      </div>
    </nav>
  );
}