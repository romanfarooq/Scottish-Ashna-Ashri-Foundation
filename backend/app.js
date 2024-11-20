import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

import adminRoutes from "./routes/adminRoutes.js";
import mobileRoutes from "./routes/mobileRoutes.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const adminCors = cors({
  origin: "http://localhost:5173",
});

const mobileCors = cors({
  methods: ["GET"],
});

// Rate Limiters
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: "Too many requests from this IP. Please try again after 15 minutes.",
});

const mobileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP. Please try again after 15 minutes.",
});

// Routes
app.use("/api/v1/admin", adminCors, adminLimiter, adminRoutes);
app.use("/api/v1/mobile", mobileCors, mobileLimiter, mobileRoutes);

export default app;
