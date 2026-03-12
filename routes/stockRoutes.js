const express = require("express");
const { createSale, getStockByProduce } = require("../controllers/salesController");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireRole("manager", "agent"), createSale);
router.get("/by-produce", requireRole("manager", "agent", "director"), getStockByProduce);

module.exports = router;
