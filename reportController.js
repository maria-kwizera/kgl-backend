const Procurement = require("../models/Procurement");
const Sale = require("../models/Sale");
const CreditSale = require("../models/CreditSale");
const { getStockMap } = require("../utils/stock");

async function getSummary(_req, res) {
  const [procurementRows, salesRows, creditRows] = await Promise.all([
    Procurement.find({}, { costUgx: 1, _id: 0 }).lean(),
    Sale.find({}, { amountPaid: 1, _id: 0 }).lean(),
    CreditSale.find({}, { amountDue: 1, _id: 0 }).lean()
  ]);

  const totalProcurementCost = procurementRows.reduce((sum, row) => sum + Number(row.costUgx || 0), 0);
  const totalCashSales = salesRows.reduce((sum, row) => sum + Number(row.amountPaid || 0), 0);
  const totalCreditOutstanding = creditRows.reduce((sum, row) => sum + Number(row.amountDue || 0), 0);

  return res.json({ totalProcurementCost, totalCashSales, totalCreditOutstanding });
}

async function getStock(_req, res) {
  const map = await getStockMap();
  const items = Object.entries(map).map(([produceName, stockKg]) => ({ produceName, stockKg }));
  return res.json({ items });
}

module.exports = { getSummary, getStock };
