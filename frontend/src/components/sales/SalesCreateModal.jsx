import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function SalesCreateModal({ onClose, onSuccess }) {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentType, setPaymentType] = useState("cash");

  useEffect(() => {
    fetchProducts();
    addItem();

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const fetchProducts = async () => {
    const res = await api.get("/api/products");
    
    setProducts(res.data);
  };

  const addItem = () => {
    setItems(prev => [
      ...prev,
      { product_id: "", quantity: 1, price: 0 }
    ]);
  };

  const deleteItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    
    const updated = [...items];

    if (field === "quantity") {
      value = Math.max(1, parseInt(value) || 1);
    }

    updated[index][field] = value;
    
    if (field === "product_id") {
      const selected = products.find(
        p => p.id === value
      );
      
      updated[index].price = selected?.sellingPrice || 0;
    }

    setItems(updated);
  };

  const selectedProductIds = items
    .map(item => item.product_id)
    .filter(id => id !== "");

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const finalTotal = subtotal - discount;

  const handleSubmit = async () => {
    await api.post("/api/sales", {
      items,
      discount,
      payment_type: paymentType,
    });

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
      <div className="relative bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create Sale</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Table Headings */}
        <div className="grid grid-cols-5 gap-4 mb-3 font-semibold text-gray-700 border-b pb-2">
          <div>Product</div>
          <div>Selling Price</div>
          <div>Quantity</div>
          <div>Line Total</div>
          <div className="text-center">Action</div>
        </div>

        {/* Items */}
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-5 gap-4 mb-4 items-center">

            {/* Product Dropdown */}
            <select
              className="border p-2 rounded"
              value={item.product_id}
              onChange={(e) =>
                handleItemChange(index, "product_id", e.target.value)
              }
            >
              <option value="">Select Product</option>
              {products
                .filter(
                  p =>
                    !selectedProductIds.includes(p.id.toString()) ||
                    p.id.toString() === item.product_id
                )
                .map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.itemId}
                  </option>
                ))}
            </select>

            {/* Selling Price (Read Only) */}
            <input
              type="number"
              className="border p-2 rounded bg-gray-100"
              value={item.price}
              readOnly
            />

            {/* Quantity */}
            <input
              type="number"
              min="1"
              className="border p-2 rounded"
              value={item.quantity}
              onChange={(e) =>
                handleItemChange(index, "quantity", e.target.value)
              }
            />

            {/* Line Total */}
            <div className="font-semibold">
              ₹ {item.quantity * item.price}
            </div>

            {/* Delete Button */}
            <div className="text-center">
              <button
                onClick={() => deleteItem(index)}
                className="text-red-600 hover:text-red-800 font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {/* Add Item */}
        <button
          onClick={addItem}
          className="bg-blue-600 text-white px-4 py-2 rounded mb-6"
        >
          + Add Item
        </button>
        <div className="flex gap-4">
        {["cash", "upi", "card", "bank transfer"].map(type => (
          <label key={type} className="flex items-center gap-2">
            <input
              type="radio"
              name="paymentType"
              value={type}
              checked={paymentType === type}
              onChange={(e) => setPaymentType(e.target.value)}
            />
            {type.toUpperCase()}
          </label>
        ))}
      </div>
        {/* Summary */}
        <div className="border-t pt-4 space-y-3 max-w-md ml-auto">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹ {subtotal}</span>
          </div>

          <div className="flex justify-between items-center">
            <span>Discount:</span>
            <input
              type="number"
              min="0"
              className="border p-1 rounded w-32 text-right"
              value={discount}
              onChange={(e) =>
                setDiscount(Math.max(0, parseFloat(e.target.value) || 0))
              }
            />
          </div>

          <div className="flex justify-between text-lg font-bold">
            <span>Final Total:</span>
            <span>₹ {finalTotal}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={items.length === 0}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Complete Sale
          </button>
        </div>
      </div>
    </div>
  );
}
