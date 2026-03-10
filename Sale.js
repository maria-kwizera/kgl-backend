const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    produceName: { type: String, required: true, trim: true },
    tonnageKg: { type: Number, required: true },
    amountPaid: { type: Number, required: true },
    buyerName: { type: String, required: true, trim: true },
    salesAgent: { type: String, required: true, trim: true },
    saleDate: { type: String, required: true },
    saleTime: { type: String, required: true },
    createdByRole: { type: String, default: "agent" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", saleSchema);
