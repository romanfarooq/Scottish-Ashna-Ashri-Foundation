import { Router } from "express";
import { isAuthenticatedAdmin } from "../middleware/authMiddleware.js";
import {
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  isLoggedIn,
  verifyOtp,
} from "../controllers/adminController.js";
import { getAbout, updateAbout } from "../controllers/aboutController.js";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/change-password", isAuthenticatedAdmin, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.get("/is-authenticated", isLoggedIn);

router.get("/about", isAuthenticatedAdmin, getAbout);
router.post("/about", isAuthenticatedAdmin, updateAbout);

export default router;
