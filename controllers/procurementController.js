const Procurement = require("../models/Procurement");
const { BRANCHES, PRODUCE } = require("./index");
const { isAlphaNum, isAlphabetic, isMoney, isPhone, isTonnage, required } = require("../utils/validation");

async function createProcurement(req, res) {
  const payload = req.body || {};

  const errors = [];
  if (!isAlphaNum(payload.produceName, 2)) errors.push("Invalid produceName");
  if (!isAlphabetic(payload.produceType, 2)) errors.push("Invalid produceType");
  if (!required(payload.procDate)) errors.push("procDate is required");
  if (!required(payload.procTime)) errors.push("procTime is required");
  if (!isTonnage(payload.tonnageKg)) errors.push("Invalid tonnageKg");
  if (!isMoney(payload.costUgx, 5)) errors.push("Invalid costUgx");
  if (!isAlphaNum(payload.dealerName, 2)) errors.push("Invalid dealerName");
  if (!required(payload.branchName) || !BRANCHES.includes(payload.branchName)) errors.push("Invalid branchName");
  if (!isPhone(payload.contact)) errors.push("Invalid contact");
  if (!isMoney(payload.sellPrice, 5)) errors.push("Invalid sellPrice");
  if (payload.produceName && !PRODUCE.includes(payload.produceName)) errors.push("Unsupported produceName");

  if (errors.length) return res.status(400).json({ message: "Validation failed", errors });

  const row = await Procurement.create({
    ...payload,
    tonnageKg: Number(payload.tonnageKg),
    costUgx: Number(payload.costUgx),
    sellPrice: Number(payload.sellPrice),
    createdBy: req.auth?.username || "unknown"
  });

  return res.status(201).json({ id: row._id, message: "Procurement recorded" });
}

async function listProcurements(_req, res) {
  const items = await Procurement.find({})
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  return res.json({ items });
}

module.exports = { createProcurement, listProcurements };
