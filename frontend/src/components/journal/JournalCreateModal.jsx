import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function JournalCreateModal({ onClose, onSuccess }) {
  const [accounts, setAccounts] = useState([]);
  const [entries, setEntries] = useState([
    { accountId: "", debit: "", credit: "" }
  ]);

  const [date, setDate] = useState("");
  const [narration, setNarration] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const fetchAccounts = async () => {
    const res = await api.get("/api/accounts");
    setAccounts(res.data);
  };

  const addRow = () => {
    setEntries([
      ...entries,
      { accountId: "", debit: "", credit: "" }
    ]);
  };

  const deleteRow = (index) => {
    const updated = entries.filter((_, i) => i !== index);
    setEntries(updated);
  };

  const handleChange = (index, field, value) => {
    const updated = [...entries];

    if (field === "debit" || field === "credit") {
      value = Math.max(0, value);
      if (field === "debit") updated[index].credit = "";
      if (field === "credit") updated[index].debit = "";
    }

    updated[index][field] = value;
    setEntries(updated);
  };

  const totalDebit = entries.reduce(
    (sum, e) => sum + Number(e.debit || 0),
    0
  );

  const totalCredit = entries.reduce(
    (sum, e) => sum + Number(e.credit || 0),
    0
  );

  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSubmit = async () => {
    if (!isBalanced) {
      alert("Journal is not balanced");
      return;
    }

    setLoading(true);

    await api.post("/api/journal", {
      date,
      narration,
      entries
    });

    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-5xl rounded-xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Manual Journal Entry
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Date & Narration */}
        <div className="grid grid-cols-2 gap-6 mb-6">

          <div>
            <label className="block text-sm font-semibold mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Narration
            </label>
            <input
              type="text"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 w-full"
            />
          </div>

        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Account</th>
                <th className="px-4 py-3 text-right">Debit</th>
                <th className="px-4 py-3 text-right">Credit</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={index} className="border-t">

                  <td className="px-4 py-3">
                    <select
                      value={entry.accountId}
                      onChange={(e) =>
                        handleChange(index, "accountId", e.target.value)
                      }
                      className="border border-gray-300 rounded-lg p-2 w-full"
                    >
                      <option value="">Select Account</option>
                      {accounts.map(acc => (
                        <option key={acc._id} value={acc._id}>
                          {acc.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      min="0"
                      value={entry.debit}
                      onChange={(e) =>
                        handleChange(index, "debit", e.target.value)
                      }
                      className="border border-gray-300 rounded-lg p-2 w-full text-right"
                    />
                  </td>

                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      min="0"
                      value={entry.credit}
                      onChange={(e) =>
                        handleChange(index, "credit", e.target.value)
                      }
                      className="border border-gray-300 rounded-lg p-2 w-full text-right"
                    />
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => deleteRow(index)}
                      className="text-red-600 hover:text-red-800 font-semibold"
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Row */}
        <button
          onClick={addRow}
          className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          + Add Row
        </button>

        {/* Totals */}
        <div className="mt-6 max-w-md ml-auto space-y-2">

          <div className="flex justify-between">
            <span>Total Debit:</span>
            <span className="text-red-600 font-semibold">
              ₹ {totalDebit}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Total Credit:</span>
            <span className="text-green-600 font-semibold">
              ₹ {totalCredit}
            </span>
          </div>

          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Status:</span>
            <span className={isBalanced ? "text-green-600" : "text-red-600"}>
              {isBalanced ? "Balanced" : "Not Balanced"}
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 mt-6 border-t pt-4">

          <button
            onClick={onClose}
            className="px-5 py-2 rounded border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!isBalanced || loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Journal"}
          </button>

        </div>

      </div>
    </div>
  );
}