export default function EmptyState({ message = "Nothing here yet." }) {
  return (
    <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
      <p>{message}</p>
    </div>
  );
}