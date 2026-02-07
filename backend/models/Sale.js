const mongoose = require("mongoose");

const saleItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  itemId: String, // snapshot
  name: String,   // snapshot
  quantity: Number,
  sellingPrice: Number,
  costPrice: Number,
  lineTotal: Number,
  profit: Number,
});

const saleSchema = new mongoose.Schema(
  {
    invoiceNo: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    items: [saleItemSchema],

    subtotal: Number,
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: Number,
    totalProfit: Number,

    paymentType: {
      type: String,
      enum: ["cash", "card", "upi", "bank", "credit"],
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", saleSchema);