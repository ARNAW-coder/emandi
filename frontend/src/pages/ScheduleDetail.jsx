import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../context/ToastContext";

export default function ScheduleDetail() {
  const { id } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const load = async () => {
      const res = await api.get(`/schedules/${id}`);
      setSchedule(res.data.data);

      // Already checked in? Skip straight to the live queue page.
      try {
        await api.get(`/queue/my-position?scheduleId=${id}`);
        navigate(`/farmer/queue/${id}`);
      } catch {
        // not checked in yet — show the check-in form below
      }
    };
    load();
  }, [id]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    setError("");
    try {
      const res = await api.post("/queue/check-in", { scheduleId: id, fiveLeftAlertEnabled: alertEnabled });
      showToast(`Checked in! Your token is #${res.data.data.tokenNumber}`);
      navigate(`/farmer/queue/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Check-in failed");
    } finally {
      setCheckingIn(false);
    }
  };

  if (!schedule) return <LoadingSpinner label="Loading schedule..." />;

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="bg-white border rounded-lg p-6">
        <h1 className="text-xl font-bold">{schedule.crop}</h1>
        <p className="text-gray-600">{schedule.mandi?.name}</p>
        <p className="text-gray-500 text-sm mb-4">{schedule.startTime} - {schedule.endTime}</p>

        <label className="flex items-center gap-2 mb-4 text-sm">
          <input type="checkbox" checked={alertEnabled} onChange={(e) => setAlertEnabled(e.target.checked)} />
          Alert me when 5 farmers are left ahead of me
        </label>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <button
          onClick={handleCheckIn}
          disabled={checkingIn || schedule.status !== "OPEN"}
          className="w-full bg-green-600 text-white rounded py-2 font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {checkingIn ? "Checking in..." : schedule.status !== "OPEN" ? "Schedule Closed" : "Check In"}
        </button>
      </div>
    </div>
  );
}