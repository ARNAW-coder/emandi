const STATUS_STYLES = {
  PENDING: { background: "#fef3c7", label: "Pending" },
  PROCESSED: { background: "#dbeafe", label: "Processing" },
  RELEASED: { background: "#dcfce7", label: "Released" },
};

export default function PaymentStatusCard({ amount, status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.PENDING;
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: "1rem", background: style.background }}>
      <p style={{ margin: 0, color: "#555" }}>Payment</p>
      <h2 style={{ margin: "0.25rem 0" }}>₹{amount}</h2>
      <strong>{style.label}</strong>
    </div>
  );
}