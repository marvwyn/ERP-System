const mongoose = require("mongoose");

const journalEntrySchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  accountName: String,
  debit: {
    type: Number,
    default: 0,
  },
  credit: {
    type: Number,
    default: 0,
  },
});

const journalSchema = new mongoose.Schema(
  {
    voucherNo: {
      type: String,
      required: true,
      unique: true,
    },
    voucherType: {
      type: String,
      enum: ["SALE", "PURCHASE", "JV"],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    narration: String,
    entries: [journalEntrySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Journal", journalSchema);
