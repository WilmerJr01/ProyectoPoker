import { Router } from "express";
import userRoutes from "./userRoutes.js";
// import gameRoutes from "./gameRoutes.js";
// import tableRoutes from "./tableRoutes.js";

const router = Router();

router.use("/users", userRoutes);
// router.use("/games", gameRoutes);
// router.use("/tables", tableRoutes);

export default router;
