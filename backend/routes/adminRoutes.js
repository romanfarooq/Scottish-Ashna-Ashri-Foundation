import { Router } from "express";
import { audioUpload } from "../config/upload.js";
import { isAuthenticatedAdmin } from "../middleware/authMiddleware.js";
import { getAbout, updateAbout } from "../controllers/aboutController.js";
import {
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  isLoggedIn,
  verifyOtp,
} from "../controllers/adminController.js";
import {
  addAudio,
  addAyah,
  addSurah,
  addTranslation,
  deleteAudio,
  deleteSurah,
  deleteTranslation,
  getAllSurahs,
  getAudio,
  getSurahByNumber,
  updateSurah,
} from "../controllers/surahController.js";

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

router.get("/surahs", isAuthenticatedAdmin, getAllSurahs);
router.get("/surahs/:surahNumber", isAuthenticatedAdmin, getSurahByNumber);
router.post("/surahs", isAuthenticatedAdmin, addSurah);
router.put("/surahs/:surahNumber", isAuthenticatedAdmin, updateSurah);
router.delete("/surahs/:surahNumber", isAuthenticatedAdmin, deleteSurah);
router.post("/surahs/:surahNumber/ayat", isAuthenticatedAdmin, addAyah);
router.post(
  "/surahs/:surahNumber/ayat/:ayahNumber/audio",
  isAuthenticatedAdmin,
  audioUpload.single("audio"),
  addAudio
);
router.get(
  "/surahs/:surahNumber/ayat/:ayahNumber/audio",
  isAuthenticatedAdmin,
  getAudio
);
router.delete(
  "/surahs/:surahNumber/ayat/:ayahNumber/audio",
  isAuthenticatedAdmin,
  deleteAudio
);
router.post(
  "/surahs/:surahNumber/translations",
  isAuthenticatedAdmin,
  addTranslation
);
router.delete(
  "/surahs/:surahNumber/translations/:language",
  isAuthenticatedAdmin,
  deleteTranslation
);

export default router;
