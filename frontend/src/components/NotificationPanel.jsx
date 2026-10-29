export default function NotificationPanel({ notifications, onMarkRead }) {
  if (notifications.length === 0) return <p className="text-gray-500 text-center py-6">No notifications yet.</p>;
  return (
    <div className="border rounded-lg divide-y bg-white">
      {notifications.map((n) => (
        <div
          key={n._id}
          onClick={() => !n.isRead && onMarkRead(n._id)}
          className={`p-3 cursor-pointer ${n.isRead ? "bg-white" : "bg-blue-50"}`}
        >
          <p className="text-sm">{n.message}</p>
          <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}