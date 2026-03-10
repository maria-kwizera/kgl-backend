require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { connectDB } = require("./config/db");
const { withAuthContext } = require("./middleware/auth");
const { ensureDefaultUsers } = require("./services/seedUsers");

const authRoutes = require("./routes/authRoutes");
const procurementRoutes = require("./routes/procurementRoutes");
const salesRoutes = require("./routes/salesRoutes");
const stockRoutes = require("./routes/stockRoutes");
const creditSalesRoutes = require("./routes/creditSalesRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());
app.use(morgan("dev"));
app.use(withAuthContext);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "kgl-backend", ts: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/procurements", procurementRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/credit-sales", creditSalesRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/reports", reportRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found", path: req.originalUrl });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    message: "Internal server error",
    detail: process.env.NODE_ENV === "production" ? undefined : err.message
  });
});

async function start() {
  await connectDB(process.env.MONGODB_URI);
  await ensureDefaultUsers();
  app.listen(port, () => {
    console.log(`KGL backend running on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server", err.message);
  process.exit(1);
});
