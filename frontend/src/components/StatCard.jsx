export default function StatCard({ label, value }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: "1rem", textAlign: "center" }}>
      <p style={{ margin: 0, color: "#666" }}>{label}</p>
      <h2 style={{ margin: "0.25rem 0" }}>{value}</h2>
    </div>
  );
}

