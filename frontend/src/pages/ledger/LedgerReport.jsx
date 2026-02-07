import { useEffect, useState } from "react";
import api from "../../api/axios";
import JournalCreateModal from "../../components/journal/JournalCreateModal";

export default function LedgerReport() {
  const today = new Date().toISOString().split("T")[0];
  const [accounts, setAccounts] = useState([]);
  const [account, setAccount] = useState("CASH");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);

  const fetchAccounts = async () => {
    const res = await api.get("/api/accounts");
    setAccounts(res.data);
  };

  const loadLedger = async () => {
    setLoading(true);
    const res = await api.get(
      `/api/ledger?account=${account}&from=${fromDate}&to=${toDate}`
    );
    setLedgerData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
    loadLedger();
  }, []);


  const downloadCSV = () => {
    if (!ledgerData) return;
  
    const { openingBalance, transactions, closingBalance } = ledgerData;
  
    const totalDebit = transactions.reduce(
      (sum, row) => sum + Number(row.debit),
      0
    );
  
    const totalCredit = transactions.reduce(
      (sum, row) => sum + Number(row.credit),
      0
    );
  
    let rows = [];
  
    // Report Header Section
    rows.push(["Ledger Report"]);
    rows.push(["Account", account]);
    rows.push(["From Date", fromDate]);
    rows.push(["To Date", toDate]);
    rows.push([]);
    rows.push(["Opening Balance", openingBalance]);
    rows.push(["Total Debit", totalDebit]);
    rows.push(["Total Credit", totalCredit]);
    rows.push(["Closing Balance", closingBalance]);
    rows.push([]);
  
    // Table Header
    rows.push(["Date", "Voucher", "Debit", "Credit", "Balance"]);
  
    // Transactions
    transactions.forEach(row => {
      rows.push([
        new Date(row.date).toLocaleDateString(),
        row.voucherNo,
        row.debit || "",
        row.credit || "",
        row.balance
      ]);
    });
  
    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map(r => r.join(",")).join("\n");
  
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
  
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Ledger_${account}_${fromDate}_to_${toDate}.csv`
    );
  
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openingBalance = ledgerData?.openingBalance || 0;
  const transactions = ledgerData?.transactions || [];
  const closingBalance = ledgerData?.closingBalance || 0;

  const totalDebit = transactions.reduce(
    (sum, row) => sum + Number(row.debit),
    0
  );

  const totalCredit = transactions.reduce(
    (sum, row) => sum + Number(row.credit),
    0
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Ledger Report
        </h1>
      </div>

      {/* Filter Card - ALWAYS VISIBLE */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">

        <div className="flex flex-wrap gap-4 items-end">

          <div>
            <label className="block text-sm font-semibold mb-1">
              Account
            </label>
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="border border-gray-300 rounded-lg p-2"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.name}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              max={today}
              onChange={(e) => {
                setFromDate(e.target.value);

                if (toDate && e.target.value > toDate) {
                  setToDate("");
                }
              }}
              className="border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              min={fromDate || ""}
              max={today}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-gray-300 rounded-lg p-2"
            />
          </div>

          <button
            onClick={loadLedger}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Loading..." : "Load Report"}
          </button>
          <button
            onClick={() => setShowJournalModal(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Journal
          </button>
          {ledgerData && (
            <button
              onClick={downloadCSV}
              className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Download CSV
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {ledgerData && (
        <div className="grid grid-cols-4 gap-4 mb-6">

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Opening Balance</p>
            <p className="text-lg font-bold">₹ {openingBalance}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total Debit</p>
            <p className="text-lg font-bold text-red-600">
              ₹ {totalDebit}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Total Credit</p>
            <p className="text-lg font-bold text-green-600">
              ₹ {totalCredit}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Closing Balance</p>
            <p className="text-lg font-bold">
              ₹ {closingBalance}
            </p>
          </div>

        </div>
      )}

      {/* Table */}
      {ledgerData && (
        <div className="bg-white rounded-xl shadow-md p-6">

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Voucher</th>
                  <th className="px-4 py-3 text-right">Debit</th>
                  <th className="px-4 py-3 text-right">Credit</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((row, index) => (
                  <tr
                    key={index}
                    className="border-t hover:bg-blue-50 transition"
                  >
                    <td className="px-4 py-3">
                      {new Date(row.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {row.voucherNo}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600 font-medium">
                      {row.debit > 0 ? `₹ ${row.debit}` : ""}
                    </td>
                    <td className="px-4 py-3 text-right text-green-600 font-medium">
                      {row.credit > 0 ? `₹ ${row.credit}` : ""}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      ₹ {row.balance}
                    </td>
                  </tr>
                ))}

                <tr className="bg-gray-100 font-bold border-t">
                  <td colSpan="2" className="px-4 py-3 text-right">
                    Total
                  </td>
                  <td className="px-4 py-3 text-right text-red-600">
                    ₹ {totalDebit}
                  </td>
                  <td className="px-4 py-3 text-right text-green-600">
                    ₹ {totalCredit}
                  </td>
                  <td></td>
                </tr>

                <tr className="bg-green-100 font-bold">
                  <td colSpan="4" className="px-4 py-3 text-right">
                    Closing Balance
                  </td>
                  <td className="px-4 py-3 text-right">
                    ₹ {closingBalance}
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

        </div>
      )}
      {showJournalModal && (
        <JournalCreateModal
          onClose={() => setShowJournalModal(false)}
          onSuccess={loadLedger}
        />
      )}
    </div>
  );
}