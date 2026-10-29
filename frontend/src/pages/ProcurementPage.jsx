import { useEffect, useState } from "react";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

const PAYMENT_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PROCESSED: "bg-blue-100 text-blue-700",
  RELEASED: "bg-green-100 text-green-700",
};

export default function ProcurementPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/procurement/my").then((res) => setRecords(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading procurement history..." />;
  if (records.length === 0) return <EmptyState message="No procurement records yet." />;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">My Procurement & Payments</h1>
      <div className="grid gap-3">
        {records.map((r) => (
          <div key={r._id} className="border rounded-lg p-4 bg-white flex justify-between items-center">
            <div>
              <p className="font-semibold">{r.crop} — {r.quantity}kg @ ₹{r.rate}/kg</p>
              <p className="text-gray-500 text-sm">{r.queueEntry?.schedule?.mandi?.name}</p>
              <p className="text-gray-500 text-sm">{new Date(r.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">₹{r.totalAmount}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${PAYMENT_COLORS[r.payment?.status] || "bg-gray-100 text-gray-600"}`}>
                {r.payment?.status || "NO PAYMENT"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}