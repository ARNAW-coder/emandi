import { useState } from "react";

export default function RecordProcurementModal({ entry, onClose, onSubmit }) {
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const previewTotal = quantity && rate ? (Number(quantity) * Number(rate)).toFixed(2) : "0.00";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await onSubmit({ queueEntryId: entry._id, quantity: Number(quantity), rate: Number(rate) });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record procurement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h3 className="font-bold text-lg mb-1">Record Procurement</h3>
        <p className="text-gray-500 text-sm mb-4">Token #{entry.tokenNumber} — {entry.farmer?.name}</p>

        <label className="block text-sm font-medium mb-1">Quantity (kg)</label>
        <input type="number" min="0.01" step="0.01" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full border rounded px-3 py-2 mb-3" required />

        <label className="block text-sm font-medium mb-1">Rate (₹/kg)</label>
        <input type="number" min="0.01" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} className="w-full border rounded px-3 py-2 mb-3" required />

        <p className="text-sm text-gray-500 mb-4">
          Preview: <strong>₹{previewTotal}</strong>
          <span className="text-xs block text-gray-400">(the server recalculates and stores the real total independently)</span>
        </p>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm">Cancel</button>
          <button disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50">
            {submitting ? "Saving..." : "Confirm"}
          </button>
        </div>
      </form>
    </div>
  );
}