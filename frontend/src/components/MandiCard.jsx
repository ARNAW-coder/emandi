export default function MandiCard({ mandi }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: "1rem" }}>
      <h3>{mandi.name}</h3>
      <p>{mandi.location}</p>
    </div>
  );
}