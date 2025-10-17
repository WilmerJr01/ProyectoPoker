import { Router } from "express";
import {
    createPayOut,
    getPayOuts,
    getPayOutById
} from "../controllers/payOut.controller.js";

const payOutRoutes = Router();

payOutRoutes.post("/", createPayOut); // Crear mesa
payOutRoutes.get("/", getPayOuts); // Obtener todas las mesas
payOutRoutes.get("/:id", getPayOutById); // Obtener mesa por ID

export default payOutRoutes;
