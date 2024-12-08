import { Router } from "express";
import { audioUpload, imageUpload } from "../config/upload.js";
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
  addAyah,
  addAyahAudio,
  addSurah,
  addSurahAudio,
  addTranslation,
  deleteAyahAudio,
  deleteSurah,
  deleteSurahAudio,
  deleteSurahImages,
  deleteTranslation,
  getAllSurahs,
  getAllSurahsWithImages,
  getAyahAudio,
  getSurahAudio,
  getSurahByNumber,
  getSurahImages,
  updateSurah,
  uploadSurahImages,
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
router.get("/surahsWithImages", isAuthenticatedAdmin, getAllSurahsWithImages);
router.get("/surahs/:surahNumber", isAuthenticatedAdmin, getSurahByNumber);
router.post("/surahs", isAuthenticatedAdmin, addSurah);
router.put("/surahs/:surahNumber", isAuthenticatedAdmin, updateSurah);
router.delete("/surahs/:surahNumber", isAuthenticatedAdmin, deleteSurah);
router.post(
  "/surahs/:surahNumber/audio",
  isAuthenticatedAdmin,
  audioUpload.single("audio"),
  addSurahAudio
);
router.get("/surahs/:surahNumber/audio", isAuthenticatedAdmin, getSurahAudio);
router.delete(
  "/surahs/:surahNumber/audio",
  isAuthenticatedAdmin,
  deleteSurahAudio
);

router.post("/surahs/:surahNumber/ayat", isAuthenticatedAdmin, addAyah);
router.post(
  "/surahs/:surahNumber/ayat/:ayahNumber/audio",
  isAuthenticatedAdmin,
  audioUpload.single("audio"),
  addAyahAudio
);
router.get(
  "/surahs/:surahNumber/ayat/:ayahNumber/audio",
  isAuthenticatedAdmin,
  getAyahAudio
);
router.delete(
  "/surahs/:surahNumber/ayat/:ayahNumber/audio",
  isAuthenticatedAdmin,
  deleteAyahAudio
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
router.get("/surahs/:surahNumber/images", isAuthenticatedAdmin, getSurahImages);
router.post(
  "/surahs/:surahNumber/images",
  isAuthenticatedAdmin,
  imageUpload.array("images"),
  uploadSurahImages
);
router.delete(
  "/surahs/:surahNumber/images",
  isAuthenticatedAdmin,
  deleteSurahImages
);

export default router;
