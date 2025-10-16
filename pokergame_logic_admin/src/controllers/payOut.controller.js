// controllers/payout.controller.js
import PayOut from "../models/PayOut.js";

// ✅ Crear retiro (PayOut)
export const createPayOut = async (req, res) => {
    try {
        const { user, amount, cardNumber, notes } = req.body;

        // Validación básica
        if (!user || !amount || !cardNumber) {
            return res.status(400).json({
                message:
                    "Los campos 'user', 'amount' y 'cardNumber' son obligatorios",
            });
        }

        const payOut = new PayOut({
            user,
            amount,
            cardNumber,
            notes,
        });

        await payOut.save();
        res.status(201).json(payOut);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ✅ Obtener todos los retiros
export const getPayOuts = async (req, res) => {
    try {
        const payOuts = await PayOut.find();
        res.json(payOuts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Obtener un retiro por ID
export const getPayOutById = async (req, res) => {
    try {
        const payOut = await PayOut.findById(req.params.id);
        if (!payOut)
            return res.status(404).json({ message: "Retiro no encontrado" });
        res.json(payOut);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Actualizar retiro
export const updatePayOut = async (req, res) => {
    try {
        const payOut = await PayOut.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!payOut)
            return res.status(404).json({ message: "Retiro no encontrado" });
        res.json(payOut);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ✅ Eliminar retiro
export const deletePayOut = async (req, res) => {
    try {
        const payOut = await PayOut.findByIdAndDelete(req.params.id);
        if (!payOut)
            return res.status(404).json({ message: "Retiro no encontrado" });
        res.json({ message: "Retiro eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
