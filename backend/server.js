import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import MongoStore from "connect-mongo";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";
import passport from "./config/passport.js";
import adminRoutes from "./routes/adminRoutes.js";
import mobileRoutes from "./routes/mobileRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    rolling: true,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true, // Protects against XSS
      secure: process.env.NODE_ENV === "production", // Only use secure cookies in production
      sameSite: "lax", // Prevents CSRF
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Middleware to adjust session maxAge based on user role
// app.use((req, res, next) => {
//   if (req.isAuthenticated() && req.user.role === "admin") {
//     req.session.cookie.maxAge = 15 * 60 * 1000; // 15 minutes for Admin
//   }
//   next();
// });

// CORS Configuration
const adminCors = cors({
  origin: "http://localhost:5173",
  credentials: true,
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
