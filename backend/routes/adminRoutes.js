import { Router } from "express";
import { getAdminData, postAdminData } from "../controllers/adminController.js";

const router = Router();

router.get("/", getAdminData);
router.post("/", postAdminData);

export default router;
