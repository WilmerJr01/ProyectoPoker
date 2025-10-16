import { Router } from "express";
import userRoutes from "./userRoutes.routes.js";
import tableRoutes from "./tableRoutes.routes.js";
import payOutRoutes from "./payOutRoutes.routes.js";
import payInRoutes from "./payInRoutes.routes.js";
import adminRoutes from "./adminRoutes.routes.js";
import { authMiddleware } from "../middleware/authMiddleare.js";

const router = Router();

router.use("/payIn", authMiddleware, payInRoutes);
router.use("/tables", authMiddleware, tableRoutes);
router.use("/user", authMiddleware, userRoutes);
router.use("/payOut", authMiddleware, payOutRoutes);
router.use("/admin", authMiddleware, adminRoutes);

export default router;
