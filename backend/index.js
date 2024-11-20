import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import adminRoutes from "./routes/adminRoutes.js";
import mobileRoutes from "./routes/mobileRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const adminCors = cors({
  origin: "http://localhost:5173",
});

const mobileCors = cors({
  methods: ["GET"],
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/admin", adminCors, adminRoutes);
app.use("/api/mobile", mobileCors, mobileRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
