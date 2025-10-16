import Admin from "../models/Admin.js";

// ✅ Crear admin
export const createAdmin = async (req, res) => {
    try {
        const { name, lastName, nickname, password, rol, tables } = req.body;

        // Validación básica
        if (!name || !lastName || !nickname || !password || !rol) {
            return res
                .status(400)
                .json({ message: "Todos los campos son requeridos" });
        }

        const admin = new Admin({
            name,
            lastName,
            nickname,
            password,
            rol,
            tables: tables || [],
        });

        await admin.save();
        res.status(201).json(admin);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ✅ Obtener todos los admins
export const getAdmins = async (req, res) => {
    try {
        // populate para mostrar info básica de las tablas si las tiene
        const admins = await Admin.find();
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Obtener admin por ID
export const getAdminById = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);
        if (!admin)
            return res
                .status(404)
                .json({ message: "Administrador no encontrado" });
        res.json(admin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Actualizar admin
export const updateAdmin = async (req, res) => {
    try {
        const admin = await Admin.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!admin)
            return res
                .status(404)
                .json({ message: "Administrador no encontrado" });
        res.json(admin);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ✅ Eliminar admin
export const deleteAdmin = async (req, res) => {
    try {
        const admin = await Admin.findByIdAndDelete(req.params.id);
        if (!admin)
            return res
                .status(404)
                .json({ message: "Administrador no encontrado" });
        res.json({ message: "Administrador eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
