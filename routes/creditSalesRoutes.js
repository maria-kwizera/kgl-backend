const express = require("express");
const { createCreditSale, listCreditSales, recordCreditPayment } = require("../controllers/salesController");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireRole("manager", "agent"), createCreditSale);
router.get("/", requireRole("manager", "agent", "director"), listCreditSales);
router.patch("/:id/payment", requireRole("manager", "agent"), recordCreditPayment);

module.exports = router;
