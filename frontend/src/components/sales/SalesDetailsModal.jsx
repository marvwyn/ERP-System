import { useEffect, useState, useContext } from "react";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

export default function SalesDetailsModal({ saleId, onClose }) {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (saleId) fetchInvoice();
  }, [saleId]);

  const fetchInvoice = async () => {
    const res = await api.get(`/api/sales/${saleId}`);
    console.log(res.data);
    
    setData(res.data);
  };

  const downloadInvoice = () => {
    window.print();
  };

  if (!saleId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">

        {!data ? (
          <div>Loading...</div>
        ) : (
          <>
            {(() => {
              const { invoice, items } = data;

              return (
                <>
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">
                      Invoice: {invoice.invoiceNo}
                    </h1>
                    <div className="space-x-2">
                      <button
                        onClick={downloadInvoice}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                      >
                        Download
                      </button>
                      <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  <table className="w-full border-collapse border mb-6">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2">Item ID</th>
                        <th className="border p-2">Item Name</th>
                        <th className="border p-2">Qty</th>
                        <th className="border p-2">Sales Price</th>
                        <th className="border p-2">Line Total</th>
                        {user.role === "owner" && (
                          <th className="border p-2">Profit</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td className="border p-2">{item.itemId}</td>
                          <td className="border p-2">{item.name}</td>
                          <td className="border p-2">{item.quantity}</td>
                          <td className="border p-2">₹ {item.sellingPrice}</td>
                          <td className="border p-2">₹ {item.lineTotal}</td>
                          {user.role === "owner" && (
                            <td className="border p-2 text-green-600">
                              ₹ {item.profit}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Summary */}
                  <div className="space-y-2 text-right">
                    <div>Subtotal: ₹ {invoice.subtotal}</div>
                    <div>Discount: ₹ {invoice.discount}</div>
                    <div className="font-bold text-lg">
                      Final Total: ₹ {invoice.totalAmount}
                    </div>

                    {user.role === "owner" && (
                      <>
                        <div>Gross Profit: ₹ {invoice.grossProfit}</div>
                        <div className="font-bold text-green-600">
                          Net Profit: ₹ {invoice.totalProfit}
                        </div>
                      </>
                    )}
                  </div>
                </>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}