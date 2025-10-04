// configureSocket.js
import Table from "../models/Table.js";

export const configureSocket = (io) => {
    // Mapas útiles para direccionar mensajes si lo necesitas
    const userIdToSocket = new Map();
    const socketToUserId = new Map();

    io.on("connect", (socket) => {
        console.log("✅ Socket conectado:", socket.id);

        // 1) Registrar usuario (el cliente debe emitir 'register' con su userId)
        socket.on("register", (rawUserId) => {
            const userId = String(rawUserId || "").trim();
            if (!userId) {
                socket.emit("register:error", "userId inválido");
                return;
            }

            // Si ese user ya estaba conectado, opcionalmente reemplaza la sesión previa
            const prevSocketId = userIdToSocket.get(userId);
            if (prevSocketId && prevSocketId !== socket.id) {
                const prevSocket = io.sockets.sockets.get(prevSocketId);
                prevSocket?.emit("session:replaced");
                prevSocket?.disconnect(true);
            }

            userIdToSocket.set(userId, socket.id);
            socketToUserId.set(socket.id, userId);
            socket.data.userId = userId;

            socket.emit("register:ok", { userId, socketId: socket.id });
            console.log(`🪪 Registrado userId=${userId} en socket=${socket.id}`);
        });

        // 2) Unirse a una mesa
        socket.on("joinTable", async (tableId, ack) => {
            try {
                const userId = socket.data.userId || socketToUserId.get(socket.id);
                if (!userId) {
                    const msg = "Debes registrarte primero (emitir 'register' con userId).";
                    socket.emit("joinTable:error", msg);
                    if (typeof ack === "function") ack({ ok: false, error: msg });
                    return;
                }
                if (!tableId) {
                    const msg = "Falta tableId.";
                    socket.emit("joinTable:error", msg);
                    if (typeof ack === "function") ack({ ok: false, error: msg });
                    return;
                }

                const table = await Table.findById(tableId);
                if (!table) {
                    const msg = "La mesa no existe.";
                    socket.emit("joinTable:error", msg);
                    if (typeof ack === "function") ack({ ok: false, error: msg });
                    return;
                }

                await socket.join(tableId);

                // Evita duplicados del mismo user en la mesa
                await Table.findByIdAndUpdate(
                    tableId,
                    { $addToSet: { players: userId } },
                    { new: true }
                );

                io.to(tableId).emit("playerJoined", { userId, tableId });
                if (typeof ack === "function") ack({ ok: true });

                console.log(`👤 ${userId} se unió a la mesa ${tableId}`);
            } catch (err) {
                console.error(err);
                const msg = "Error al unirse a la mesa.";
                socket.emit("joinTable:error", msg);
                if (typeof ack === "function") ack({ ok: false, error: msg });
            }
        });

        // 3) (Opcional) Salir de una mesa
        socket.on("leaveTable", async (tableId, ack) => {
            try {
                const userId = socket.data.userId || socketToUserId.get(socket.id);
                await socket.leave(tableId);
                io.to(tableId).emit("playerLeft", { userId, tableId });
                if (typeof ack === "function") ack({ ok: true });
            } catch (err) {
                if (typeof ack === "function") ack({ ok: false, error: err.message });
            }
        });

        // Mensaje de bienvenida (no bloqueante)
        socket.emit("welcome", "Bienvenido al servidor de Poker 🎲");

        // Limpieza al desconectar
        socket.on("disconnect", () => {
            const userId = socketToUserId.get(socket.id);
            if (userId && userIdToSocket.get(userId) === socket.id) {
                userIdToSocket.delete(userId);
            }
            socketToUserId.delete(socket.id);
            console.log("❌ Socket desconectado:", socket.id);
        });
    });

    // Por si te sirve externamente
    return { userIdToSocket };
};
