export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "1rem", color: "#666" }}>
      <div style={{
        width: 16, height: 16, border: "2px solid #ddd", borderTopColor: "#16a34a",
        borderRadius: "50%", animation: "spin 0.6s linear infinite",
      }} />
      <span>{label}</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}