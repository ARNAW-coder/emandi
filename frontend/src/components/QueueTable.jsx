export default function QueueTable({ queue }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left" }}>Token</th>
          <th style={{ textAlign: "left" }}>Farmer</th>
          <th style={{ textAlign: "left" }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {queue.map((entry) => (
          <tr key={entry._id}>
            <td>#{entry.tokenNumber}</td>
            <td>{entry.farmer?.name}</td>
            <td>{entry.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}