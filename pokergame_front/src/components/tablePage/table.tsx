import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { createSocket, joinTable, leaveTable } from "../../socket"; // 👈 reutilizamos las funciones centralizadas
import type { UserData } from "../../types";

export default function TablePage() {
    const { id: tableId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const userData = JSON.parse(localStorage.getItem("userData") || "null") as UserData | null;
    const tableData = JSON.parse(localStorage.getItem("tableData") || "null");

    const [players, setPlayers] = useState<string[]>([]);

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        if (!tableId) return;

        // Verificar token antes de continuar
        const port = import.meta.env.VITE_PORT_AUTH;
        axios.post(`${port}/auth/verify`, { token })
            .then((response) => {
                if (!response.data.valid) navigate("/login");
            })
            .catch((error) => {
                console.error("Error al verificar el token:", error);
                navigate("/login");
            });

        // === Conexión con el socket ===
        const socket = createSocket();

        // Unirse a la mesa con la función ya hecha en socket.ts
        joinTable(tableId).then((res) => {
            if (!res.ok) {
                console.error("Error al unirse a la mesa:", res.error);
                return;
            }
            console.log(`✅ Usuario ${userId} unido a la mesa ${tableId}`);
        });

        // Escuchar actualizaciones de jugadores
        socket.on("players:update", ({ players }: { tableId: string; players: string[] }) => {
            console.log("♻️ Jugadores actualizados:", players);
            setPlayers(players);
        });

        socket.on("joinTable:error", (msg: string) => {
            console.error("⚠️ joinTable:error:", msg);
        });

        // Limpieza al desmontar la página
        return () => {
            leaveTable(tableId);
            socket.off("players:update");
            socket.off("joinTable:error");
        };
    }, [tableId, navigate, token]);

    return (
        <div className="body_table">
            <h1>Estás en la mesa: {tableId} como {userData?.name}</h1>
            <h3>tableData.id: {tableData?.id}</h3>

            <section>
                <h2>Jugadores en la mesa</h2>
                {players.length ? (
                    <ul>
                        {players.map((p) => (
                            <li key={p}>{p}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No hay jugadores todavía…</p>
                )}
            </section>
        </div>
    );
}
