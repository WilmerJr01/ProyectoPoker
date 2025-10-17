import { Router } from "express";
import {
    createPayOut,
    getPayOuts,
    getPayOutById,
    updatePayOut,
    deletePayOut,
} from "../controllers/payOut.controller.js";

const payOutRoutes = Router();

payOutRoutes.post("/", createPayOut); // Crear mesa
payOutRoutes.get("/", getPayOuts); // Obtener todas las mesas
payOutRoutes.get("/:id", getPayOutById); // Obtener mesa por ID
payOutRoutes.put("/:id", updatePayOut); // Actualizar mesa
payOutRoutes.delete("/:id", deletePayOut); // Eliminar mesa

export default payOutRoutes;
