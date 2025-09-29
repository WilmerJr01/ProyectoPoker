import { Router } from "express";
import { getUsers, getUserById, createUser, updateUser, deleteUser } from "../controllers/userController.js";

const router = Router();

// GET /api/users → lista todos los usuarios
router.get("/", getUsers);

// GET /api/users/:id → obtiene un usuario por id
router.get("/:id", getUserById);

// POST /api/users → crea un usuario
router.post("/", createUser);

// PUT /api/users/:id → actualiza un usuario
router.put("/:id", updateUser);

// DELETE /api/users/:id → elimina un usuario
router.delete("/:id", deleteUser);

export default router;
