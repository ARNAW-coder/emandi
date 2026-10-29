export default function NotificationBell({ unreadCount }) {
  return (
    <div className="relative text-xl">
      🔔
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5">{unreadCount}</span>
      )}
    </div>
  );
}