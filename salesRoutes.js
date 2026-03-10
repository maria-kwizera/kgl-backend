const express = require("express");
const { createSale, listSales } = require("../controllers/salesController");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireRole("manager", "agent"), createSale);
router.get("/", requireRole("manager", "agent", "director"), listSales);

module.exports = router;
