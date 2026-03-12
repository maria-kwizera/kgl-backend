const express = require("express");
const { createProcurement, listProcurements } = require("../controllers/procurementController");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireRole("manager"), createProcurement);
router.get("/", requireRole("manager", "director"), listProcurements);

module.exports = router;
