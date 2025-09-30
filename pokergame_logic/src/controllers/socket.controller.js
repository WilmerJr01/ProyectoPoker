import Table from "../models/Table.js";

export const configureSocket = (io) => {
    const userIdToSocket = new Map();

    io.on("connection", async (socket) => {
        console.log("✅ Usuario conectado:", socket.id);

        // Evento que el cliente emite cuando quiere unirse a una mesa
        socket.on("joinTable", async (tableId) => {
            try {
                // Aquí puedes verificar que la mesa exista en la DB
                const table = await Table.findById(tableId);
                if (!table) {
                    socket.emit("error", "La mesa no existe");
                    return;
                }

                // Unir el socket a la sala de la mesa
                socket.join(tableId);

                if (!table.players.includes(userId)) {
                    await axios.put(
                        `http://localhost:4000/api/tables/update/${tableId}`,
                        {
                            players: [...table.players, userId],
                        }
                    );
                }

                // Notificar a todos en la mesa que un nuevo jugador se unió
                io.to(tableId).emit("playerJoined", { userId: socket.id });

                console.log(
                    `Usuario ${socket.id} se unió a la mesa ${tableId}`
                );
            } catch (err) {
                console.error(err);
                socket.emit("error", "Error al unirse a la mesa");
            }
        });

        // Bienvenida al usuario
        socket.emit("welcome", "Bienvenido al servidor de Poker 🎲");

        // Desconexión
        socket.on("disconnect", () => {
            console.log("❌ Usuario desconectado:", socket.id);
        });
    });

    return userIdToSocket;
};
