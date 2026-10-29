import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import { useToast } from "../context/ToastContext";

const CROPS = ["WHEAT", "RICE", "ONION", "TOMATO", "POTATO"];

export default function AdminDashboard() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ crop: "WHEAT", date: "", startTime: "09:00", endTime: "16:00", maxFarmers: 30 });
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const load = () => {
    api.get("/schedules").then((res) => setSchedules(res.data.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/schedules", form);
      showToast("Schedule created");
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create schedule");
    }
  };

  const handleClose = async (id) => {
    await api.patch(`/schedules/${id}/close`);
    showToast("Schedule closed");
    load();
  };

  if (loading) return <LoadingSpinner label="Loading schedules..." />;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">My Mandi's Schedules</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium">
          {showForm ? "Cancel" : "+ New Schedule"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border rounded-lg p-4 mb-6 grid gap-3 sm:grid-cols-2">
          <select value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} className="border rounded px-3 py-2">
            {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="border rounded px-3 py-2" required />
          <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="border rounded px-3 py-2" />
          <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="border rounded px-3 py-2" />
          <input type="number" min="1" value={form.maxFarmers} onChange={(e) => setForm({ ...form, maxFarmers: Number(e.target.value) })} className="border rounded px-3 py-2" placeholder="Max farmers" />
          <button className="bg-green-600 text-white rounded py-2 font-medium sm:col-span-2">Create</button>
          {error && <p className="text-red-600 text-sm sm:col-span-2">{error}</p>}
        </form>
      )}

      {schedules.length === 0 ? (
        <EmptyState message="No schedules yet — create one above." />
      ) : (
        <div className="grid gap-3">
          {schedules.map((s) => (
            <div key={s._id} className="bg-white border rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{s.crop}</p>
                <p className="text-gray-500 text-sm">{new Date(s.date).toLocaleDateString()} · {s.startTime}-{s.endTime} · max {s.maxFarmers}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full ${s.status === "OPEN" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{s.status}</span>
                <Link to={`/admin/queue/${s._id}`} className="text-sm text-green-700 font-medium hover:underline">View Queue</Link>
                {s.status === "OPEN" && <button onClick={() => handleClose(s._id)} className="text-sm text-red-600 font-medium hover:underline">Close</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}