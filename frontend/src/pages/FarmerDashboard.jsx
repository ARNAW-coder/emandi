import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ScheduleCard from "../components/ScheduleCard";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

export default function FarmerDashboard() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/schedules?status=OPEN")
      .then((res) => setSchedules(res.data.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load schedules"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading schedules..." />;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Today's Open Schedules</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {schedules.length === 0 ? (
        <EmptyState message="No open schedules right now. Check back later." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {schedules.map((s) => (
            <Link key={s._id} to={`/farmer/schedule/${s._id}`}>
              <ScheduleCard schedule={s} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}