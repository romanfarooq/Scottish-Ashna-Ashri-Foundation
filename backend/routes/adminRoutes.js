import { Router } from "express";
import { audioUpload, imageUpload } from "../config/upload.js";
import { isAuthenticatedAdmin } from "../middleware/authMiddleware.js";
import { getAbout, updateAbout } from "../controllers/aboutController.js";
import {
  addDua,
  addDuaTranslation,
  deleteDua,
  deleteDuaAudio,
  deleteDuaTranslation,
  getAllDuas,
  getDuaAudio,
  getDuaById,
  updateDua,
  updateDuaTranslation,
  uploadDuaAudio,
} from "../controllers/duaController.js";
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
  deleteSurahTajweedImages,
  deleteTajweedRuleImage,
  deleteTranslation,
  downloadSurahImagesZip,
  downloadSurahTajweedImagesZip,
  getAllSurahs,
  getAllSurahsWithImages,
  getAllSurahsWithTajweedImages,
  getAyahAudio,
  getSurahAudio,
  getSurahByNumber,
  getSurahImages,
  getSurahTajweedImages,
  getTajweedRuleImage,
  updateSurah,
  uploadSurahImages,
  uploadSurahTajweedImages,
  AddTajweedRuleImage,
} from "../controllers/surahController.js";
import {
  getAllZiarahs,
  getZiarahById,
  addZiarah,
  updateZiarah,
  deleteZiarah,
  getZiarahAudio,
  uploadZiarahAudio,
  deleteZiarahAudio,
  addZiarahTranslation,
  updateZiarahTranslation,
  deleteZiarahTranslation,
} from "../controllers/ziarahController.js";
import {
  getAllTaqibaats,
  getTaqibaatById,
  addTaqibaat,
  updateTaqibaat,
  deleteTaqibaat,
  getTaqibaatAudio,
  uploadTaqibaatAudio,
  deleteTaqibaatAudio,
  addTaqibaatTranslation,
  updateTaqibaatTranslation,
  deleteTaqibaatTranslation,
} from '../controllers/taqibaatController.js';
import {
  getAllSahifas,
  getSahifaById,
  addSahifa,
  updateSahifa,
  deleteSahifa,
  getSahifaAudio,
  uploadSahifaAudio,
  deleteSahifaAudio,
  addSahifaTranslation,
  updateSahifaTranslation,
  deleteSahifaTranslation,
} from '../controllers/sahifaController.js';


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
router.get(
  "/surahsWithTajweedImages",
  isAuthenticatedAdmin,
  getAllSurahsWithTajweedImages
);
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
router.get(
  "/surahs/:surahNumber/images/download",
  isAuthenticatedAdmin,
  downloadSurahImagesZip
);
router.get(
  "/surahs/:surahNumber/tajweedImages",
  isAuthenticatedAdmin,
  getSurahTajweedImages
);
router.post(
  "/surahs/:surahNumber/tajweedImages",
  isAuthenticatedAdmin,
  imageUpload.array("images"),
  uploadSurahTajweedImages
);
router.delete(
  "/surahs/:surahNumber/tajweedImages",
  isAuthenticatedAdmin,
  deleteSurahTajweedImages
);
router.get(
  "/surahs/:surahNumber/tajweedImages/download",
  isAuthenticatedAdmin,
  downloadSurahTajweedImagesZip
);
router.get("/tajweed-rule-image", isAuthenticatedAdmin, getTajweedRuleImage);
router.post(
  "/tajweed-rule-image",
  isAuthenticatedAdmin,
  imageUpload.single("image"),
  AddTajweedRuleImage
);
router.delete(
  "/tajweed-rule-image",
  isAuthenticatedAdmin,
  deleteTajweedRuleImage
);

router.get("/duas", isAuthenticatedAdmin, getAllDuas);
router.get("/duas/:id", isAuthenticatedAdmin, getDuaById);
router.post("/duas", isAuthenticatedAdmin, addDua);
router.put("/duas/:id", isAuthenticatedAdmin, updateDua);
router.delete("/duas/:id", isAuthenticatedAdmin, deleteDua);
router.get("/duas/:id/audio", isAuthenticatedAdmin, getDuaAudio);
router.post(
  "/duas/:id/audio",
  isAuthenticatedAdmin,
  audioUpload.single("audio"),
  uploadDuaAudio
);
router.delete("/duas/:id/audio", isAuthenticatedAdmin, deleteDuaAudio);
router.post("/duas/:id/translations", isAuthenticatedAdmin, addDuaTranslation);
router.put(
  "/duas/:id/translations/:language",
  isAuthenticatedAdmin,
  updateDuaTranslation
);
router.delete(
  "/duas/:id/translations/:language",
  isAuthenticatedAdmin,
  deleteDuaTranslation
);

router.get("/ziarahs", isAuthenticatedAdmin, getAllZiarahs);
router.get("/ziarahs/:id", isAuthenticatedAdmin, getZiarahById);
router.post("/ziarahs", isAuthenticatedAdmin, addZiarah);
router.put("/ziarahs/:id", isAuthenticatedAdmin, updateZiarah);
router.delete("/ziarahs/:id", isAuthenticatedAdmin, deleteZiarah);
router.get("/ziarahs/:id/audio", isAuthenticatedAdmin, getZiarahAudio);
router.post(
  "/ziarahs/:id/audio",
  isAuthenticatedAdmin,
  audioUpload.single("audio"),
  uploadZiarahAudio
);
router.delete("/ziarahs/:id/audio", isAuthenticatedAdmin, deleteZiarahAudio);
router.post(
  "/ziarahs/:id/translations",
  isAuthenticatedAdmin,
  addZiarahTranslation
);
router.put(
  "/ziarahs/:id/translations/:language",
  isAuthenticatedAdmin,
  updateZiarahTranslation
);
router.delete(
  "/ziarahs/:id/translations/:language",
  isAuthenticatedAdmin,
  deleteZiarahTranslation
);


router.get("/taqibaats", isAuthenticatedAdmin, getAllTaqibaats);
router.get("/taqibaats/:id", isAuthenticatedAdmin, getTaqibaatById);
router.post("/taqibaats", isAuthenticatedAdmin, addTaqibaat);
router.put("/taqibaats/:id", isAuthenticatedAdmin, updateTaqibaat);
router.delete("/taqibaats/:id", isAuthenticatedAdmin, deleteTaqibaat);
router.get("/taqibaats/:id/audio", isAuthenticatedAdmin, getTaqibaatAudio);
router.post(
  "/taqibaats/:id/audio",
  isAuthenticatedAdmin,
  audioUpload.single("audio"),
  uploadTaqibaatAudio
);
router.delete("/taqibaats/:id/audio", isAuthenticatedAdmin, deleteTaqibaatAudio);
router.post(
  "/taqibaats/:id/translations",
  isAuthenticatedAdmin,
  addTaqibaatTranslation
);
router.put(
  "/taqibaats/:id/translations/:language",
  isAuthenticatedAdmin,
  updateTaqibaatTranslation
);
router.delete(
  "/taqibaats/:id/translations/:language",
  isAuthenticatedAdmin,
  deleteTaqibaatTranslation
);

router.get("/sahifas", isAuthenticatedAdmin, getAllSahifas);
router.get("/sahifas/:id", isAuthenticatedAdmin, getSahifaById);
router.post("/sahifas", isAuthenticatedAdmin, addSahifa);
router.put("/sahifas/:id", isAuthenticatedAdmin, updateSahifa);
router.delete("/sahifas/:id", isAuthenticatedAdmin, deleteSahifa);
router.get("/sahifas/:id/audio", isAuthenticatedAdmin, getSahifaAudio);
router.post(
  "/sahifas/:id/audio",
  isAuthenticatedAdmin,
  audioUpload.single("audio"),
  uploadSahifaAudio
);
router.delete("/sahifas/:id/audio", isAuthenticatedAdmin, deleteSahifaAudio);
router.post(
  "/sahifas/:id/translations",
  isAuthenticatedAdmin,
  addSahifaTranslation
);
router.put(
  "/sahifas/:id/translations/:language",
  isAuthenticatedAdmin,
  updateSahifaTranslation
);
router.delete(
  "/sahifas/:id/translations/:language",
  isAuthenticatedAdmin,
  deleteSahifaTranslation
);


export default router;
