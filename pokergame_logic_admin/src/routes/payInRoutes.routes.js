import { Router } from "express";
import {
    createPayIn,
    getPayIns,
    getPayInById,
    updatePayIn,
    deletePayIn,
} from "../controllers/payIn.controller.js";

const payInRoutes = Router();

payInRoutes.post("/", createPayIn);       // Crear recarga
payInRoutes.get("/", getPayIns);          // Obtener todas
payInRoutes.get("/:id", getPayInById);    // Obtener por ID
payInRoutes.put("/:id", updatePayIn);     // Actualizar
payInRoutes.delete("/:id", deletePayIn);  // Eliminar

export default payInRoutes;
