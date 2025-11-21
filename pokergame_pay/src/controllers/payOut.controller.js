// controllers/payout.controller.js
import PayOut from "../models/PayOut.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config()

// ✅ Crear retiro (PayOut)
export const createPayOut = async (req, res) => {
    try {
        const { user, amount, cardNumber, notes, token, stackinicial } = req.body;

        if (!user || !amount || !cardNumber || !token || !stackinicial) {
            return res.status(400).json({
                message:
                    "Los campos 'user', 'amount', 'cardNumber', 'token' y 'stack' son obligatorios",
            });
        }
        const { verify } = await axios.post(`${process.env.URL_AUTH}/auth/verify`, { token })

        if (verify?.valid) {
            return res.status(400).json({ message: "Token no valido" })
        }

        const payOut = new PayOut({
            user,
            amount,
            cardNumber,
            notes,
        });

        await payOut.save();

        axios.put(`${process.env.URL_API}/api/user/${user}`,
            { "stack": (stackinicial - amount) },
            {
                headers: { Authorization: `Bearer ${token}` }
            })

        res.status(201).json(payOut);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ✅ Obtener todos los retiros
export const getPayOuts = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: "Missing userId" });
        }

        // Filtro base: solo transacciones del usuario actual
        const filter = { userId };

        const payIns = await PayOut.find(filter).sort({ createdAt: -1 });

        res.json(payIns);

    } catch (error) {
        res.status(500).json({ message: error.message });
    };
}

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