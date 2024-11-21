import { Router } from "express";
import { authenticate } from "passport";
import { isAuthenticated } from "../middleware/verifyAdmin.js";
import {
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/adminController.js";

const router = Router();

router.post("/login", authenticate("local"), login);
router.post("/logout", logout);
router.post("/change-password", isAuthenticated, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
