import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import supabase from "./config/supabase.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Home Route
app.get("/", (req, res) => {
  res.send("🚀 AI Finance Tracker Backend Running...");
});

// Test Supabase Connection
app.get("/test", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*");

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Transaction Routes
app.use("/api/transactions", transactionRoutes);

// AI finance insights
app.use("/api/ai", aiRoutes);

// Start Server
const PORT = process.env.PORT || 6913;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}

export default app;