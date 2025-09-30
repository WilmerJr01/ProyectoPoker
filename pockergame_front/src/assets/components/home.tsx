import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createSocket } from "../../socket";

export default function HomePage() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        // Conectamos solo aquí
        const socket = createSocket();

        socket.on("connect", () => {
            console.log("✅ Conectado al servidor:", socket.id);
            const userId = localStorage.getItem("userId");
            if (userId) socket.emit("register", userId);
        });

        socket.on("welcome", (msg) => console.log("👋 Mensaje del servidor:", msg));
        socket.on("disconnect", () => console.log("❌ Desconectado del servidor"));

        return () => {
            socket.disconnect();
        };
    }, []);

    return <h1>Bienvenido al Juego Poker 🎲</h1>;
}
