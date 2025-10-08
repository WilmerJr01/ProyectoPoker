import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSocket } from "../../socket";
import axios from "axios";
import OptionBar from "../optionBar/optionBar";
import "./home.css";
import LobbyCard from "../lobby/lobbyCard";
import type { Lobby } from "../../types";

export default function HomePage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const [lobbys, setLobbys] = useState<Lobby[]>([]);

    useEffect(() => {
        console.log("UserID en HomePage:", userId);
        if (!token) {
            navigate("/login");
            return;
        }

        // Verificar token
        axios.post("http://localhost:3001/auth/verify", { token })
            .then((response) => {
                if (!response.data.valid) {
                    navigate("/login");
                }
            })
            .catch((error) => {
                console.error("Error al verificar el token:", error);
                navigate("/login");
            });

        // --- Fetch automático ---
        const fetchLobbys = async () => {
            try {
                const port = import.meta.env.VITE_PORT_BACK;
                const res = await axios.get(`${port}/api/tables/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setLobbys(res.data);
            } catch (err) {
                console.error("Error al obtener los lobbys:", err);
            }
        };

        // Llamada inicial
        fetchLobbys();

        // Repetir cada 10 segundos (puedes cambiar el tiempo)
        const interval = setInterval(fetchLobbys, 10000);

        const socket = createSocket();

        const handleWelcome = (msg: string) => console.log("👋", msg);

        socket.on("welcome", handleWelcome);

        // Limpieza al desmontar
        return () => {
            clearInterval(interval);
            socket.off("welcome", handleWelcome);
        };
    }, []);


    return (
        <div className="home-page">
            <OptionBar />
            <div className="count_lobbys">
                <h1>Lobbys Online: {lobbys.length}</h1>
            </div>
            <div className="body_home">
                <div className="lobbys">
                    {lobbys.length > 0 ? (
                        <ul>
                            {lobbys.map((thislobby) => (
                                <LobbyCard key={thislobby._id} lobby={thislobby} />
                            ))}
                        </ul>
                    ) : (
                        <p>No hay mesas disponibles.</p>
                    )}
                </div>
                <div className="info_lobby"></div>
            </div>
        </div>

    );
}
