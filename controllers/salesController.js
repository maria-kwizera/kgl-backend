const mongoose = require("mongoose");
const Sale = require("../models/Sale");
const CreditSale = require("../models/CreditSale");
const Procurement = require("../models/Procurement");
const { isAlphaNum, isMoney, isTonnage, required, isNin, isPhone, isAlphabetic } = require("../utils/validation");
const { getStockOf } = require("../utils/stock");

async function createSale(req, res) {
  const payload = req.body || {};

  const errors = [];
  if (!required(payload.produceName)) errors.push("produceName is required");
  if (!isTonnage(payload.tonnageKg)) errors.push("Invalid tonnageKg");
  if (!isMoney(payload.amountPaid, 5)) errors.push("Invalid amountPaid");
  if (!isAlphaNum(payload.buyerName, 2)) errors.push("Invalid buyerName");
  if (!isAlphaNum(payload.salesAgent, 2)) errors.push("Invalid salesAgent");
  if (!required(payload.saleDate)) errors.push("saleDate is required");
  if (!required(payload.saleTime)) errors.push("saleTime is required");

  if (errors.length) return res.status(400).json({ message: "Validation failed", errors });

  const inStock = await getStockOf(payload.produceName);
  const requested = Number(payload.tonnageKg);
  if (requested > inStock) {
    return res.status(400).json({ message: "Insufficient stock. Notify manager." });
  }

  const row = await Sale.create({
    ...payload,
    tonnageKg: requested,
    amountPaid: Number(payload.amountPaid),
    createdByRole: req.auth?.role || "agent"
  });

  return res.status(201).json({ id: row._id, message: "Sale recorded" });
}

async function createCreditSale(req, res) {
  const payload = req.body || {};

  const errors = [];
  if (!isAlphaNum(payload.buyerName, 2)) errors.push("Invalid buyerName");
  if (!isNin(payload.nationalId)) errors.push("Invalid nationalId");
  if (!isAlphaNum(payload.location, 2)) errors.push("Invalid location");
  if (!isPhone(payload.contact)) errors.push("Invalid contact");
  if (!isMoney(payload.amountDue, 5)) errors.push("Invalid amountDue");
  if (!isAlphaNum(payload.salesAgent, 2)) errors.push("Invalid salesAgent");
  if (!required(payload.dueDate)) errors.push("dueDate is required");
  if (!isAlphaNum(payload.produceName, 2)) errors.push("Invalid produceName");
  if (!isAlphabetic(payload.produceType, 2)) errors.push("Invalid produceType");
  if (!isTonnage(payload.tonnageKg)) errors.push("Invalid tonnageKg");
  if (!required(payload.dispatchDate)) errors.push("dispatchDate is required");

  if (errors.length) return res.status(400).json({ message: "Validation failed", errors });

  const inStock = await getStockOf(payload.produceName);
  const requested = Number(payload.tonnageKg);
  if (requested > inStock) {
    return res.status(400).json({ message: "Insufficient stock. Notify manager." });
  }

  const row = await CreditSale.create({
    ...payload,
    tonnageKg: requested,
    amountDue: Number(payload.amountDue),
    amountPaid: 0,
    remainingAmount: Number(payload.amountDue),
    paymentStatus: "unpaid",
    createdByRole: req.auth?.role || "agent"
  });

  return res.status(201).json({ id: row._id, message: "Credit sale recorded" });
}

async function getStockByProduce(req, res) {
  const produceName = String(req.query.produceName || "").trim();
  if (!produceName) return res.status(400).json({ message: "produceName query is required" });

  const stockKg = await getStockOf(produceName);
  const latestProc = await Procurement.findOne({ produceName }).sort({ createdAt: -1 }).lean();
  const sellingPrice = latestProc?.sellPrice || null;

  return res.json({ produceName, stockKg, sellingPrice });
}

async function listSales(_req, res) {
  const items = await Sale.find({})
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  return res.json({ items });
}

async function listCreditSales(_req, res) {
  const items = await CreditSale.find({})
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  return res.json({ items });
}

async function recordCreditPayment(req, res) {
  const creditSaleId = String(req.params.id || "").trim();
  const payload = req.body || {};
  const amountRaw = String(payload.amount || "").trim();
  const paymentDate = String(payload.paymentDate || "").trim();

  if (!creditSaleId) return res.status(400).json({ message: "Credit sale id is required" });
  if (!mongoose.isValidObjectId(creditSaleId)) return res.status(400).json({ message: "Invalid credit sale id" });
  if (!/^\d+$/.test(amountRaw) || Number(amountRaw) <= 0) {
    return res.status(400).json({ message: "Invalid payment amount" });
  }
  if (!required(paymentDate)) return res.status(400).json({ message: "paymentDate is required" });

  const row = await CreditSale.findById(creditSaleId);
  if (!row) return res.status(404).json({ message: "Credit sale not found" });

  const currentPaid = Number(row.amountPaid || 0);
  const currentRemaining = Number(row.remainingAmount ?? row.amountDue ?? 0);
  const paymentAmount = Number(amountRaw);

  if (paymentAmount > currentRemaining) {
    return res.status(400).json({ message: "Payment exceeds remaining balance" });
  }

  const nextPaid = currentPaid + paymentAmount;
  const nextRemaining = currentRemaining - paymentAmount;
  const nextStatus = nextRemaining <= 0 ? "paid" : "partial";

  row.amountPaid = nextPaid;
  row.remainingAmount = nextRemaining;
  row.paymentStatus = nextStatus;
  row.paymentHistory.push({
    amount: paymentAmount,
    paymentDate,
    receivedBy: req.auth?.username || ""
  });

  await row.save();

  return res.json({
    message: "Credit payment recorded",
    item: {
      id: row._id,
      amountDue: row.amountDue,
      amountPaid: row.amountPaid,
      remainingAmount: row.remainingAmount,
      paymentStatus: row.paymentStatus
    }
  });
}

module.exports = { createSale, createCreditSale, getStockByProduce, listSales, listCreditSales, recordCreditPayment };
