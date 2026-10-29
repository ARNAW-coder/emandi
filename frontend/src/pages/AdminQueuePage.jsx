import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import socket from "../services/socket";
import LoadingSpinner from "../components/LoadingSpinner";
import RecordProcurementModal from "../components/RecordProcurementModal";
import { useToast } from "../context/ToastContext";

export default function AdminQueuePage() {
  const { id: scheduleId } = useParams();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalEntry, setModalEntry] = useState(null);
  const { showToast } = useToast();

  const loadQueue = () => {
    api.get(`/queue/${scheduleId}`).then((res) => setQueue(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQueue();
    // socket.connect();
    socket.emit("join:schedule", scheduleId);
    socket.on("queue:update", loadQueue);
    return () => socket.off("queue:update", loadQueue);
  }, [scheduleId]);

  const handleProcessNext = async () => {
    try {
      const res = await api.post(`/queue/${scheduleId}/process`);
      showToast(`Now weighing Token #${res.data.data.tokenNumber} — ${res.data.data.farmer.name}`);
    } catch (err) {
      showToast(err.response?.data?.message || "No farmers waiting");
    }
  };

  const handleRecordProcurement = async ({ queueEntryId, quantity, rate }) => {
    const res = await api.post("/procurement", { queueEntryId, quantity, rate });
    showToast(`Procurement recorded — ₹${res.data.data.procurement.totalAmount}`);
    setModalEntry(null);
    loadQueue();
  };

  if (loading) return <LoadingSpinner label="Loading queue..." />;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Live Queue</h1>
        <button onClick={handleProcessNext} className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium">Process Next</button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr><th className="p-3">Token</th><th className="p-3">Farmer</th><th className="p-3">Status</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {queue.map((entry) => (
              <tr key={entry._id} className="border-t">
                <td className="p-3">#{entry.tokenNumber}</td>
                <td className="p-3">{entry.farmer?.name}</td>
                <td className="p-3">{entry.status}</td>
                <td className="p-3">
                  {entry.status === "WEIGHING" && (
                    <button onClick={() => setModalEntry(entry)} className="text-green-700 font-medium hover:underline">Record Procurement</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalEntry && <RecordProcurementModal entry={modalEntry} onClose={() => setModalEntry(null)} onSubmit={handleRecordProcurement} />}
    </div>
  );
}