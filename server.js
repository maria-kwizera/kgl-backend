require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
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
    console.log("Starting KGL backend server...");
    const isProduction = process.env.NODE_ENV === "production";
    console.log(`Environment: ${isProduction ? 'production' : 'development'}`);

    const mongoUri = process.env.MONGODB_URI;
    const localUri = process.env.MONGODB_URI_LOCAL;
    const selectedUri = isProduction ? mongoUri : (localUri || mongoUri);

    console.log(`MongoDB URI configured: ${!!selectedUri}`);
    if (!selectedUri) {
      throw new Error("No MongoDB URI configured. Set MONGODB_URI (prod) or MONGODB_URI_LOCAL (local).");
    }

    console.log("Connecting to MongoDB...");
    await connectDB(selectedUri);
    console.log("MongoDB connected successfully");

    console.log("Ensuring default users exist...");
    await ensureDefaultUsers();
    console.log("Default users check complete");

    console.log(`Starting server on port ${port}...`);
    app.listen(port, () => {
      console.log(`✅ KGL backend running on http://localhost:${port}`);
      console.log(`Health check: http://localhost:${port}/health`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    console.error("Full error:", err);
    process.exit(1);
  }
}

start();
