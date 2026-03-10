const mongoose = require("mongoose");

const procurementSchema = new mongoose.Schema(
  {
    produceName: { type: String, required: true, trim: true },
    produceType: { type: String, required: true, trim: true },
    procDate: { type: String, required: true },
    procTime: { type: String, required: true },
    tonnageKg: { type: Number, required: true },
    costUgx: { type: Number, required: true },
    dealerName: { type: String, required: true, trim: true },
    branchName: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    sellPrice: { type: Number, required: true },
    createdBy: { type: String, default: "system" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Procurement", procurementSchema);
