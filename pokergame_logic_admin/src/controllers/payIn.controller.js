import PayIn from "../models/PayIn.js";

// ✅ Crear recarga (PayIn)
export const createPayIn = async (req, res) => {
    try {
        const { user, amount, cardNumber, notes } = req.body;

        // Validación básica
        if (!user || !amount || !cardNumber) {
            return res.status(400).json({
                message:
                    "Los campos 'user', 'amount' y 'cardNumber' son obligatorios",
            });
        }

        const payIn = new PayIn({
            user,
            amount,
            cardNumber,
            notes,
        });

        await payIn.save();
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

// ✅ Actualizar recarga
export const updatePayIn = async (req, res) => {
    try {
        const payIn = await PayIn.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!payIn)
            return res.status(404).json({ message: "Recarga no encontrada" });
        res.json(payIn);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// ✅ Eliminar recarga
export const deletePayIn = async (req, res) => {
    try {
        const payIn = await PayIn.findByIdAndDelete(req.params.id);
        if (!payIn)
            return res.status(404).json({ message: "Recarga no encontrada" });
        res.json({ message: "Recarga eliminada con éxito" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
