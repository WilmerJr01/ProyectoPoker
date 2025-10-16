import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const ensureUserId = () => localStorage.getItem("userId") || undefined;

export const createSocket = (): Socket => {
  if (socket) return socket;

  const userId = ensureUserId();
  const port = import.meta.env.VITE_PORT_BACK;

  socket = io(port, {
    autoConnect: false,
    auth: { userId }, // 👈 userId va en el handshake
  });

  socket.on("connect", () => {
    console.log("✅ Conectado al servidor:", socket?.id);
    // por compatibilidad, si usas también el evento 'register' en el server:
    const uid = ensureUserId();
    if (uid) socket?.emit("register", uid);
  });

  socket.on("disconnect", () => console.log("❌ Desconectado del servidor"));
  socket.on("connect_error", (err) => console.error("⚠️ Error de conexión:", err.message));

  socket.connect();
  return socket;
};

// Si cambia el userId (p. ej. login/logout), puedes reconectar así:
export const reconnectWithAuth = () => {
  if (!socket) return;
  socket.auth = { userId: ensureUserId() };
  socket.disconnect();
  socket.connect();
};

// Espera a estar conectado antes de emitir
const ensureConnected = async (): Promise<void> => {
  if (!socket) throw new Error("Socket no inicializado");
  if (socket.connected) return;
  await new Promise<void>((resolve) => socket!.once("connect", () => resolve()));
};

export const joinTable = async (
  tableId: string
): Promise<{ ok: boolean; error?: string }> => {
  if (!socket) return { ok: false, error: "Socket no inicializado" };

  await ensureConnected(); // 👈 evita emitir antes de connect

  return new Promise((resolve) => {
    socket!.emit("joinTable", tableId, (ack: { ok: boolean; error?: string }) => {
      if (ack.ok) console.log(`🪑 Te uniste correctamente a la mesa ${tableId}`);
      else console.error("⚠️ Error al unirse a la mesa:", ack.error);
      resolve(ack);
    });

    socket!.once("joinTable:error", (msg: string) => {
      console.error("⚠️ joinTable:error:", msg);
      resolve({ ok: false, error: msg });
    });
  });
};

export const leaveTable = async (
  tableId: string
): Promise<{ ok: boolean; error?: string }> => {
  if (!socket) return { ok: false, error: "Socket no inicializado" };
  await ensureConnected(); // opcional
  return new Promise((resolve) => {
    socket!.emit("leaveTable", tableId, (ack: { ok: boolean; error?: string }) => {
      if (ack.ok) console.log(`🚪 Saliste de la mesa ${tableId}`);
      else console.error("⚠️ Error al salir:", ack.error);
      resolve(ack);
    });
  });
};
