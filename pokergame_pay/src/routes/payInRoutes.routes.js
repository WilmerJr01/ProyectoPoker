import { Router } from "express";
import {
    createPayIn,
    getPayIns,
    getPayInById,
} from "../controllers/payIn.controller.js";

const payInRoutes = Router();

payInRoutes.post("/", createPayIn);       // Crear recarga
payInRoutes.get("/", getPayIns);          // Obtener todas
payInRoutes.get("/:id", getPayInById);    // Obtener por ID

export default payInRoutes;
