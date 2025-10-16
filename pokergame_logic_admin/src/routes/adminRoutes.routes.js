import { Router } from "express";
import {
    createAdmin,
    getAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin,
} from "../controllers/admin.controller.js";

const adminRoutes = Router();

adminRoutes.post("/", createAdmin);
adminRoutes.get("/", getAdmins);
adminRoutes.get("/:id", getAdminById);
adminRoutes.put("/:id", updateAdmin);
adminRoutes.delete("/:id", deleteAdmin);

export default adminRoutes;
