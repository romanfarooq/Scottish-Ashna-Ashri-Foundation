import { Router } from "express";
import { getMobileData } from "../controllers/mobileController.js";

const router = Router();

router.get("/", getMobileData);

export default router;
