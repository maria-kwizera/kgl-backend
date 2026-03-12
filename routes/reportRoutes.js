const express = require("express");
const { getSummary, getStock } = require("../controllers/reportController");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/summary", requireRole("director"), getSummary);
router.get("/stock", requireRole("director"), getStock);

module.exports = router;
