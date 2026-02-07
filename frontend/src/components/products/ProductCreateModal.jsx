import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function ProductCreateModal({ onClose, onSuccess }) {
  const [existingItemIds, setExistingItemIds] = useState([]);

  const [form, setForm] = useState({
    name: "",
    itemId: "",
    category: "",
    description: "",
    stock: 0,
    costPrice: 0,
    sellingPrice: 0,
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    fetchExistingProducts();

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const fetchExistingProducts = async () => {
    const res = await api.get("/api/products");
    console.log(res.data);
    setExistingItemIds(res.data.map(p => p.itemId));
  };

  const handleChange = (e) => {
    let value = e.target.value;

    if (e.target.name === "item_id") {
      value = value.toUpperCase();
    }

    if (["stock", "costPrice", "sellingPrice"].includes(e.target.name)) {
      value = Math.max(0, value);
    }

    setForm({
      ...form,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("existing item ids: ",form);
    if (existingItemIds.includes(form.itemId)) {
      alert("Item Code already exists!");
      return;
    }

    try {
      await api.post("/api/products", form);
      onSuccess();
      onClose();
    } catch (err) {
      alert("Error creating product");
    }
  };

  const profit =
    parseFloat(form.sellingPrice || 0) -
    parseFloat(form.costPrice || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-2xl p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Add Product</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name + Item Code */}
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-semibold mb-1">
                Product Name *
              </label>
              <input
                name="name"
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none"
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Item Code *
              </label>
              <input
                name="itemId"
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none uppercase"
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Category
            </label>
            <input
              name="category"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Description
            </label>
            <textarea
              name="description"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none"
              onChange={handleChange}
            />
          </div>

          {/* Pricing + Stock */}
          <div className="grid grid-cols-3 gap-4">

            <div>
              <label className="block text-sm font-semibold mb-1">
                Stock
              </label>
              <input
                type="number"
                min="0"
                name="stock"
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none"
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Cost Price *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="costPrice"
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none"
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Selling Price *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="sellingPrice"
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-200 outline-none"
                onChange={handleChange}
                required
              />
            </div>

          </div>

          {/* Profit Preview */}
          <div className="text-right text-sm font-semibold">
            Profit per item:{" "}
            <span
              className={
                profit >= 0 ? "text-green-600" : "text-red-600"
              }
            >
              ₹ {profit}
            </span>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 pt-4 border-t">

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Save Product
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}
