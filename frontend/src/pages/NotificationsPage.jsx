import { useEffect, useState } from "react";
import api from "../services/api";
import socket from "../services/socket";
import NotificationPanel from "../components/NotificationPanel";
import LoadingSpinner from "../components/LoadingSpinner";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get("/notifications").then((res) => setNotifications(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  // Live update: prepend any new notification the instant it arrives,
  // instead of waiting for the next mount/refetch.
  useEffect(() => {
    const handleNew = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };
    socket.on("notification:new", handleNew);
    return () => socket.off("notification:new", handleNew);
  }, []);

  const handleMarkRead = async (idToMark) => {
    await api.patch(`/notifications/${idToMark}/read`);
    load();
  };

  if (loading) return <LoadingSpinner label="Loading notifications..." />;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Notifications</h1>
      <NotificationPanel notifications={notifications} onMarkRead={handleMarkRead} />
    </div>
  );
}