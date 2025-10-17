import { Router } from "express";
import userRoutes from "./userRoutes.routes.js";
import tableRoutes from "./tableRoutes.routes.js";
import adminRoutes from "./adminRoutes.routes.js";
import { authMiddleware } from "../middleware/authMiddleare.js";

const router = Router();

router.use("/tables", authMiddleware, tableRoutes);
router.use("/user", authMiddleware, userRoutes);
router.use("/admin", authMiddleware, adminRoutes);

export default router;
