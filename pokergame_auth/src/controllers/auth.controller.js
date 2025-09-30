import bcrypt from "bcrypt";
import User from "../models/User.js";
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

        const { name, lastName, birthDate, nickname, password } = req.body;

        // 👮 Validar campos obligatorios
        if (!name || !lastName || !birthDate || !nickname || !password) {
            return res
                .status(400)
                .json({ message: "Todos los campos son requeridos" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario pero aún no guardarlo
        const user = new User({
            name,
            lastName,
            birthDate,
            nickname,
            password: hashedPassword,
        });

        // 🔑 Generar token ANTES de guardar
        const token = generateToken(user);

        // Ahora sí guardamos
        await user.save();

        res.json({ token, userId: user._id });
    
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
        const user = await User.findOne({ nickname });

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // 👇 Ahora sí validar el password
        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const token = generateToken(user);

        res.json({ token, userId: user._id });
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
