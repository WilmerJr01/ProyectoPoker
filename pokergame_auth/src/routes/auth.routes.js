import { Router } from "express";
import { register, login, verify, getUser } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify", verify);
router.get("/user/:userId", getUser);

export default router;
