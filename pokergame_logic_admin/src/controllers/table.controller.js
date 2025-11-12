import Table from "../models/Table.js";

// Crear mesa
import Table from "../models/Table.js";

export const createTable = async (req, res) => {
    try {
        let {
            name,
            maxPlayers,
            minBuyIn,
            maxBuyIn,
            bigBlind,
            smallBlind,
        } = req.body;

        // Normalizaciones básicas
        name = (name || "").trim();
        maxPlayers = Number(maxPlayers);
        minBuyIn = Number(minBuyIn);
        maxBuyIn = Number(maxBuyIn);
        bigBlind = bigBlind !== undefined ? Number(bigBlind) : 200;
        smallBlind = smallBlind !== undefined ? Number(smallBlind) : 100;

        // Validaciones manuales (además de las del schema)
        if (!name) {
            return res.status(400).json({ message: "El nombre es requerido." });
        }
        if (!Number.isFinite(maxPlayers) || maxPlayers < 0 || maxPlayers > 9) {
            return res.status(400).json({ message: "maxPlayers debe estar entre 0 y 9." });
        }
        if (![minBuyIn, maxBuyIn, bigBlind, smallBlind].every(Number.isFinite)) {
            return res.status(400).json({ message: "minBuyIn, maxBuyIn, bigBlind, smallBlind deben ser numéricos." });
        }
        if (minBuyIn < 0 || maxBuyIn < 0) {
            return res.status(400).json({ message: "minBuyIn y maxBuyIn no pueden ser negativos." });
        }
        if (minBuyIn > maxBuyIn) {
            return res.status(400).json({ message: "minBuyIn no puede ser mayor que maxBuyIn." });
        }
        if (smallBlind <= 0 || bigBlind <= 0) {
            return res.status(400).json({ message: "smallBlind y bigBlind deben ser > 0." });
        }
        if (smallBlind >= bigBlind) {
            return res.status(400).json({ message: "smallBlind debe ser menor que bigBlind." });
        }

        // Inicialización coherente con tu esquema
        const table = new Table({
            name,
            players: [],               // vacío al crear
            maxPlayers,
            minBuyIn,
            maxBuyIn,
            bigBlind,
            smallBlind,
            inGame: false,             // mesa inactiva al crear
            currentHand: {
                order: [],               // sin mano en curso
                BTN: null,
                SB: null,
                BB: null,
                pot: 0,
                currentTurn: null,
                bets: {},                // Map<String, Number> -> inicializa como objeto vacío
                cards: {},               // Map<String, [String]> -> objeto vacío
                community: [],
            },
        });

        await table.save();
        return res.status(201).json(table);
    } catch (error) {
        // Mongoose validation / otros errores
        return res.status(400).json({ message: error.message });
    }
};


// Obtener todas las mesas
export const getTables = async (req, res) => {
    try {
        const tables = await Table.find();
        res.json(tables);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener mesa por ID
export const getTableById = async (req, res) => {
    try {
        const table = await Table.findById(req.params.id);
        if (!table)
            return res.status(404).json({ message: "Mesa no encontrada" });
        res.json(table);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar mesa
export const updateTable = async (req, res) => {
    try {
        const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!table)
            return res.status(404).json({ message: "Mesa no encontrada" });
        res.json(table);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Eliminar mesa
export const deleteTable = async (req, res) => {
    try {
        const table = await Table.findByIdAndDelete(req.params.id);
        if (!table)
            return res.status(404).json({ message: "Mesa no encontrada" });
        res.json({ message: "Mesa eliminada con éxito" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
