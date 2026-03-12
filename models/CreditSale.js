const mongoose = require("mongoose");

const creditSaleSchema = new mongoose.Schema(
  {
    buyerName: { type: String, required: true, trim: true },
    nationalId: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    amountDue: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    remainingAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["unpaid", "partial", "paid"], default: "unpaid" },
    paymentHistory: [
      {
        amount: { type: Number, required: true },
        paymentDate: { type: String, required: true },
        receivedBy: { type: String, trim: true, default: "" }
      }
    ],
    salesAgent: { type: String, required: true, trim: true },
    dueDate: { type: String, required: true },
    produceName: { type: String, required: true, trim: true },
    produceType: { type: String, required: true, trim: true },
    tonnageKg: { type: Number, required: true },
    dispatchDate: { type: String, required: true },
    createdByRole: { type: String, default: "agent" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CreditSale", creditSaleSchema);
