import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import userRoutes from "./routes/userRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8082;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log("🚀 Starting SianFinTech backend...");

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "sianfintech-api",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to SianFinTech API",
    version: "1.0.0",
    endpoints: {
      health: "GET /api/health",
      investments: "POST /api/investments",
      ai: {
        creditAssessment: "POST /api/ai/credit-assessment",
        predict: "POST /api/ai/predict"
      },
      users: "GET/POST /api/users"
    },
    documentation: "https://github.com/your-repo/docs"
  });
});

// Investment endpoint
app.post("/api/investments", (req, res) => {
  const { userId, amount, productType = "SianVendorGrowth", duration = 6 } = req.body;
  if (!userId || !amount) {
    return res.status(400).json({ status: "error", message: "userId and amount are required" });
  }

  const investment = {
    _id: "INV" + Date.now(),
    userId,
    amount,
    productType,
    duration,
    currency: "UGX",
    status: "active",
    projectedReturn: Math.floor(amount * 0.12 * (duration / 12)),
    createdAt: new Date(),
    expectedMaturity: new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000),
  };

  res.status(201).json({ status: "success", message: "Investment created successfully", investment });
});

// User routes
app.use("/api/users", userRoutes);

// AI routes
app.use("/api/ai", aiRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("🚨 Error:", error);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    status: "error", 
    message: "Endpoint not found",
    path: req.path,
    method: req.method 
  });
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server after DB connection
connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`\n🎉 SianFinTech server running on port ${PORT}`);
      console.log(`📍 Local: http://localhost:${PORT}`);
      console.log(`🌐 Network: http://0.0.0.0:${PORT}`);
      console.log(`\n📋 Available Endpoints:`);
      console.log(`✅ GET  http://localhost:${PORT}/api/health`);
      console.log(`✅ GET  http://localhost:${PORT}/`);
      console.log(`✅ POST http://localhost:${PORT}/api/investments`);
      console.log(`🔮 AI Endpoints:`);
      console.log(`   ✅ POST http://localhost:${PORT}/api/ai/credit-assessment`);
      console.log(`   ✅ POST http://localhost:${PORT}/api/ai/predict`);
      console.log(`👥 User Endpoints:`);
      console.log(`   ✅ POST http://localhost:${PORT}/api/users/register`);
      console.log(`   ✅ GET  http://localhost:${PORT}/api/users`);
      console.log(`\n🚀 Server ready!`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });

export default app;