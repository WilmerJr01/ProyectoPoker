import { Router } from "express";
import payOutRoutes from "./payOutRoutes.routes.js";
import payInRoutes from "./payInRoutes.routes.js";

const router = Router();

router.use("/payIn", payInRoutes);
router.use("/payOut", payOutRoutes);

export default router;
