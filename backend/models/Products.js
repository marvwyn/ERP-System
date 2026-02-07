const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: String,
    description: String,
    stock: {
      type: Number,
      default: 0,
    },
    costPrice: {
      type: Number,
      required: true,
    },
    sellingPrice: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);