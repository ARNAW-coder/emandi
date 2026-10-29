export default function ScheduleCard({ schedule }) {
  const dateStr = new Date(schedule.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer bg-white">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-lg">{schedule.crop}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${schedule.status === "OPEN" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {schedule.status}
        </span>
      </div>
      <p className="text-gray-600 text-sm">{schedule.mandi?.name}</p>
      <p className="text-gray-500 text-sm">{dateStr} · {schedule.startTime} - {schedule.endTime}</p>
      <p className="text-gray-500 text-sm">Capacity: {schedule.maxFarmers}</p>
    </div>
  );
}