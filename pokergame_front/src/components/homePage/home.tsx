import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createSocket } from "../../socket";
import axios from "axios";
import OptionBar from "../optionBar/optionBar";
import "./home.css";

export default function HomePage() {
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        console.log("UserID en HomePage:", userId);
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        axios.post("http://localhost:3001/auth/verify", {
            token
        }).then((response) => {
            if (!response.data.valid) {
                navigate("/login");
            }
        }).catch((error) => {
            console.error("Error al verificar el token:", error);
            navigate("/login");
        })

        const socket = createSocket();

        socket.on("connect", () => {
            console.log("✅ Conectado al servidor:", socket.id);
            console.log("Enviando userId al servidor:", userId);
            socket.emit("register", userId);
        });

        socket.on("welcome", (msg) => console.log("👋 Mensaje del servidor:", msg));
        socket.on("disconnect", () => console.log("❌ Desconectado del servidor"));

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="home-page">
            <OptionBar />
            <div className="body_home">
                <div className="lobbys"></div>
                <div className="info_lobby"></div>
            </div>
        </div>

    );
}
