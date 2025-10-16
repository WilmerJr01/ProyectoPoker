import { Router } from "express";
import { register, login, verify, getAdmin } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify", verify);
router.get("/admin/:adminId", getAdmin);

export default router;
