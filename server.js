require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const morgan = require("morgan");
const { connectDB } = require("./config/db");   // config stays at root
const { withAuthContext } = require("./src/middleware/auth");
const { ensureDefaultUsers } = require("./src/services/seedUsers");

const authRoutes = require("./src/routes/authRoutes");
const procurementRoutes = require("./src/routes/procurementRoutes");
const salesRoutes = require("./src/routes/salesRoutes");
const stockRoutes = require("./src/routes/stockRoutes");
const creditSalesRoutes = require("./src/routes/creditSalesRoutes");
const reportRoutes = require("./src/routes/reportRoutes");

const app = express();
const port = Number(process.env.PORT || 4000);

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());
app.use(morgan("dev"));
app.use(withAuthContext);

// Serve frontend if it exists alongside the backend (local dev convenience).
const frontendDir = path.resolve(__dirname, "..", "kgl-frontend");
const frontendIndex = path.join(frontendDir, "index.html");
if (fs.existsSync(frontendDir) && fs.existsSync(frontendIndex)) {
  app.use(express.static(frontendDir));
  app.get("/", (_req, res) => res.sendFile(frontendIndex));
}

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "kgl-backend", ts: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/procurements", procurementRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/credit-sales", creditSalesRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/reports", reportRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found", path: req.originalUrl });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    message: "Internal server error",
    detail: process.env.NODE_ENV === "production" ? undefined : err.message
  });
});

// Start server
async function start() {
  try {
    await connectDB(process.env.MONGODB_URI);
    await ensureDefaultUsers();
    app.listen(port, () => {
      console.log(`KGL backend running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to start server", err.message);
    process.exit(1);
  }
}

start();
