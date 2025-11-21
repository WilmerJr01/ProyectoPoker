import PayIn from "../models/PayIn.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config()

export const createPayIn = async (req, res) => {
    try {
        // ⛔ stackinicial ya no se pide
        const { user, amount, cardNumber, notes, token } = req.body;

        if (!user || !amount || !cardNumber || !token) {
            return res.status(400).json({
                message:
                    "Los campos 'user', 'amount', 'cardNumber' y 'token' son obligatorios",
            });
        }

        // ✅ Verificar token contra el AUTH_SERVICE
        const verifyResp = await axios.post(
            `${process.env.URL_AUTH}/auth/verify`,
            { token }
        );

        const isValid = verifyResp.data?.valid;

        if (!isValid) {
            return res.status(400).json({ message: "Token no válido" });
        }

        // ✅ Crear el registro PayIn
        const payIn = new PayIn({
            user,
            amount,
            cardNumber,
            notes,
        });

        await payIn.save();

        // ✅ Obtener el stack actual del usuario desde el API principal
        const userResp = await axios.get(
            `${process.env.URL_API}/api/user/${user}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        const currentStack = Number(userResp.data?.stack ?? 0);

        // 👇 Para PayIn normalmente se **suma** el amount al stack actual.
        // Si quisieras que disminuya, cambia a: currentStack - amount
        const newStack = currentStack + Number(amount);

        // ✅ Actualizar el stack del usuario
        await axios.put(
            `${process.env.URL_API}/api/user/${user}`,
            { stack: newStack },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        return res.status(201).json(payIn);
    } catch (error) {
        console.error("Error en createPayIn:", error?.response?.data || error);
        return res
            .status(400)
            .json({ message: error?.message || "Error al crear PayIn" });
    }
};


// ✅ Obtener todas las recargas
export const getPayIns = async (req, res) => {
    try {
        const { kind, userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: "Missing userId" });
        }

        // Filtro base: solo transacciones del usuario actual
        const filter = { userId };

        // Filtrar también por tipo si aplica
        if (kind === "topup" || kind === "withdrawal") {
            filter.kind = kind;
        }

        const payIns = await PayIn.find(filter).sort({ createdAt: -1 });

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