import { useEffect, useState } from "react";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";

const NEXT_STATUS = { PENDING: "PROCESSED", PROCESSED: "RELEASED" };
const STATUS_COLORS = { PENDING: "bg-yellow-100 text-yellow-700", PROCESSED: "bg-blue-100 text-blue-700", RELEASED: "bg-green-100 text-green-700" };

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const { showToast } = useToast();

  const load = () => {
    api.get("/payments/mine").then((res) => setPayments(res.data.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleAdvance = async () => {
    const { id, nextStatus } = confirmTarget;
    try {
      await api.patch(`/payments/${id}/status`, { status: nextStatus });
      showToast(`Payment marked ${nextStatus}`);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update payment");
    } finally {
      setConfirmTarget(null);
      load();
    }
  };

  if (loading) return <LoadingSpinner label="Loading payments..." />;
  if (payments.length === 0) return <EmptyState message="No payments recorded yet." />;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Payments</h1>
      <div className="grid gap-3">
        {payments.map((p) => (
          <div key={p._id} className="bg-white border rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">{p.procurement?.queueEntry?.farmer?.name}</p>
              <p className="text-gray-500 text-sm">₹{p.amount}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[p.status]}`}>{p.status}</span>
              {NEXT_STATUS[p.status] && (
                <button onClick={() => setConfirmTarget({ id: p._id, nextStatus: NEXT_STATUS[p.status] })} className="text-sm text-green-700 font-medium hover:underline">
                  Mark {NEXT_STATUS[p.status]}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!confirmTarget}
        title="Confirm Payment Update"
        message={confirmTarget ? `Mark this payment as ${confirmTarget.nextStatus}? This cannot be undone.` : ""}
        onConfirm={handleAdvance}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}