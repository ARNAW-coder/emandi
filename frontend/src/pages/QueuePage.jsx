import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import socket from "../services/socket";
import TokenCard from "../components/TokenCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function QueuePage() {
  const { id: scheduleId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/queue/my-position?scheduleId=${scheduleId}`)
      .then((res) => setPosition(res.data.data))
      .catch((err) => setError(err.response?.data?.message || "Not checked in for this schedule"))
      .finally(() => setLoading(false));
  }, [scheduleId]);

  useEffect(() => {
    if (!position) return;

    socket.emit("join:schedule", scheduleId);
    socket.emit("join:user", user._id);

    const handleQueueUpdate = ({ queue }) => {
      setPosition((prev) => {
        const mine = queue.find((e) => e.tokenNumber === prev.tokenNumber);
        const farmersAhead = queue.filter((e) => e.tokenNumber < prev.tokenNumber).length;
        return { ...prev, status: mine ? mine.status : "COMPLETED", farmersAhead, position: farmersAhead + 1 };
      });
    };
    const handleNotification = (n) => showToast(n.message);

    socket.on("queue:update", handleQueueUpdate);
    socket.on("notification:new", handleNotification);

    return () => {
      socket.off("queue:update", handleQueueUpdate);
      socket.off("notification:new", handleNotification);
      
    };
  }, [position?.tokenNumber]);

  if (loading) return <LoadingSpinner label="Loading your queue status..." />;
  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="p-6 max-w-md mx-auto">
      <TokenCard tokenNumber={position.tokenNumber} position={position.position} farmersAhead={position.farmersAhead} />
      <p className="text-center text-gray-500 mt-4">Status: <strong>{position.status}</strong></p>
    </div>
  );
}