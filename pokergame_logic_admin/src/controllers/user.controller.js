import User from "../models/User.js";

// ✅ Crear usuario
export const createUser = async (req, res) => {
    try {
        const { name, lastName, birthDate, nickname, password } = req.body;

        // Validación básica
        if (!name || !lastName || !birthDate || !nickname || !password) {
            return res
                .status(400)
                .json({ message: "Todos los campos son requeridos" });
        }

        const user = new User({
            name,
            lastName,
            birthDate,
            nickname,
            password,
        });

        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ✅ Obtener todos los usuarios
export const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Obtener un usuario por ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user)
            return res.status(404).json({ message: "Usuario no encontrado" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Actualizar usuario
export const updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!user)
            return res.status(404).json({ message: "Usuario no encontrado" });
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ✅ Eliminar usuario
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user)
            return res.status(404).json({ message: "Usuario no encontrado" });
        res.json({ message: "Usuario eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
