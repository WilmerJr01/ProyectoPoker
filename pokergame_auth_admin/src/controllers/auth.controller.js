import bcrypt from "bcrypt";
import Admin from "../models/Admin.js";
import { generateToken, verifyToken } from "../config/jwt.js";
import dotenv from "dotenv";
dotenv.config();

// Registro
export const register = async (req, res) => {
    try {
        if (!process.env.JWT_SECRET) {
            return res
                .status(500)
                .json({ message: "JWT_SECRET no está configurado" });
        }

        const { name, lastName, nickname, password, rol } = req.body;

        // 👮 Validar campos obligatorios
        if (!name || !lastName || !nickname || !password || !rol) {
            return res
                .status(400)
                .json({ message: "Todos los campos son requeridos" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario pero aún no guardarlo
        const admin = new Admin({
            name,
            lastName,
            nickname,
            password: hashedPassword,
            rol
        });

        // 🔑 Generar token ANTES de guardar
        const token = generateToken(admin);

        // Ahora sí guardamos
        await admin.save();

        res.json({ token, adminId: admin._id });
    
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Login
export const login = async (req, res) => {
    try {
        if (!process.env.JWT_SECRET) {
            return res
                .status(500)
                .json({ message: "JWT_SECRET no está configurado" });
        }

        const { nickname, password } = req.body;

        if (!nickname || !password) {
            return res
                .status(400)
                .json({ message: "Nickname y password son requeridos" });
        }

        // 👇 Primero buscar el usuario
        const admin = await Admin.findOne({ nickname });

        if (!admin) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // 👇 Ahora sí validar el password
        const valid = await bcrypt.compare(password, admin.password);

        if (!valid) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const token = generateToken(admin);

        res.json({ token, adminId: admin._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Verificación
export const verify = (req, res) => {
    const { token } = req.body;

    try {
        const decoded = verifyToken(token);
        res.json({ valid: true, user: decoded });
    } catch {
        res.json({ valid: false });
    }
};

export const getAdmin = async (req, res) => {
    const { adminId } = req.params;
    try {
        const admin = await Admin.findById(adminId).select("-password -__v -createdAt -updatedAt -tables");
        res.json(admin);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};