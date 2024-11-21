import passport from "passport";
import { Router } from "express";
import { isAuthenticated } from "../middleware/verifyAdmin.js";
import { getAdmin, login, logout, register } from "../controllers/adminController.js";

const router = Router();

router.post('/login', passport.authenticate('local'), login);
router.post('/logout', logout);
router.post('/register', register);
router.get('/protected', isAuthenticated, getAdmin);

export default router;
