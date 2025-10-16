import { useEffect, useState } from 'react';
import './optionBar.css';
import axios from 'axios';
import exitIcon from "../../assets/exitIcon.svg";
import timeIcon from "../../assets/timeIcon.svg";
import type { AdminData } from "../../types";
import { useNavigate } from 'react-router-dom';

function parseJWTiat(token: string | null): number | null {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const payload = JSON.parse(jsonPayload);
        return typeof payload.iat === 'number' ? payload.iat : null;
    } catch {
        return null;
    }
}

export default function OptionBar() {
    const navigate = useNavigate();
    const [adminData, setAdminData] = useState<AdminData | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
    const token = localStorage.getItem("token");

    const Exit = () => {
        localStorage.clear();
        navigate("/");
    };

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const pad = (n: number) => n.toString().padStart(2, "0");
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };

    // 1) Carga de admin (una sola vez)
    useEffect(() => {
        const port = import.meta.env.VITE_PORT_AUTH;
        const adminId = localStorage.getItem("adminId");
        if (!adminId || !port) return;

        axios.get(`${port}/auth/admin/${adminId}`)
            .then(res => setAdminData(res.data))
            .catch(err => console.error("Error al obtener administrador:", err));
    }, []);

    // 2) Inicializa el contador a partir del iat del JWT (sin pedir al server)
    useEffect(() => {
        const iat = parseJWTiat(token);
        if (iat == null) return;
        const now = Math.floor(Date.now() / 1000);
        setElapsedSeconds(Math.max(0, now - iat));
    }, [token]);

    // 3) Incrementa localmente cada segundo (sin llamadas HTTP)
    useEffect(() => {
        const id = setInterval(() => {
            setElapsedSeconds(prev => prev + 1);
        }, 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <div className="option-bar">
            <h2>Admin:PokerFace</h2>

            <div className="user_info">
                <div className="txtMenu">
                    <h1 className="name">Hi, {adminData?.name ?? '...'}</h1>
                    <div className="stack">
                        <img src={timeIcon} alt="Time: " />
                        <p>{formatTime(elapsedSeconds)}</p>
                    </div>
                </div>

                <button className="btnMenu" onClick={Exit}>
                    <img src={exitIcon} alt="Menu" />
                </button>
            </div>
        </div>
    );
}
