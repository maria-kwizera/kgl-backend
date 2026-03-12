const Procurement = require("../models/Procurement");
const Sale = require("../models/Sale");
const CreditSale = require("../models/CreditSale");

async function getStockMap() {
  const [procRows, salesRows, creditRows] = await Promise.all([
    Procurement.find({}, { produceName: 1, tonnageKg: 1, _id: 0 }).lean(),
    Sale.find({}, { produceName: 1, tonnageKg: 1, _id: 0 }).lean(),
    CreditSale.find({}, { produceName: 1, tonnageKg: 1, _id: 0 }).lean()
  ]);

  const stock = {};
  for (const row of procRows) {
    stock[row.produceName] = (stock[row.produceName] || 0) + Number(row.tonnageKg || 0);
  }
  for (const row of [...salesRows, ...creditRows]) {
    stock[row.produceName] = (stock[row.produceName] || 0) - Number(row.tonnageKg || 0);
  }
  return stock;
}

async function getStockOf(produceName) {
  const stock = await getStockMap();
  return stock[produceName] || 0;
}

module.exports = { getStockMap, getStockOf };
