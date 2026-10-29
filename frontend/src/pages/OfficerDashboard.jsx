import { useEffect, useState } from "react";
import api from "../services/api";
import StatCard from "../components/StatCard";
import MandiDensityChart from "../components/MandiDensityChart";
import LoadingSpinner from "../components/LoadingSpinner";

export default function OfficerDashboard() {
  const [overview, setOverview] = useState(null);
  const [density, setDensity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/analytics/overview"), api.get("/analytics/mandi-density")])
      .then(([o, d]) => { setOverview(o.data.data); setDensity(d.data.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading analytics..." />;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Government Dashboard</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <StatCard label="Farmers Today" value={overview.totalFarmersToday} />
        <StatCard label="Served" value={overview.farmersServedToday} />
        <StatCard label="Waiting" value={overview.currentlyWaiting} />
        <StatCard label="Avg Wait (min)" value={overview.averageWaitMinutes} />
        <StatCard label="Procurement (₹)" value={overview.totalProcurementAmount} />
        <StatCard label="Released (₹)" value={overview.totalPaymentsReleased} />
      </div>
      <h2 className="font-semibold mb-2">Mandi Crowd Density</h2>
      <div className="bg-white border rounded-lg p-4">
        <MandiDensityChart data={density} />
      </div>
      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <span>🟢 &lt;20 waiting</span><span>🟡 20–50 waiting</span><span>🔴 &gt;50 waiting</span>
      </div>
    </div>
  );
}