import PayIn from "../models/PayIn.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config()

// ✅ Crear recarga (PayIn)
export const createPayIn = async (req, res) => {
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

        const payIn = new PayIn({
            user,
            amount,
            cardNumber,
            notes,
        });

        await payIn.save();

        const { update } = await axios.put(`${process.env.URL_API}/api/user/${user}`,
            { "stack": (stackinicial + amount) },
            {
                headers: { Authorization: `Bearer ${token}` }
            })

        if (!update) {
            return res.status(400).json({ message: "No se realizó el retiro usuario" })
        }

        res.status(201).json(payIn);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ✅ Obtener todas las recargas
export const getPayIns = async (req, res) => {
    try {
        // Incluimos datos del usuario con populate
        const payIns = await PayIn.find();
        res.json(payIns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ Obtener una recarga por ID
export const getPayInById = async (req, res) => {
    try {
        const payIn = await PayIn.findById(req.params.id);
        if (!payIn)
            return res.status(404).json({ message: "Recarga no encontrada" });
        res.json(payIn);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};