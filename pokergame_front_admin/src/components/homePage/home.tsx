import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import OptionBar from "../optionBar/optionBar";
import retiroIcon from "../../assets/retirosIcon.svg";
import recargaIcon from "../../assets/recargaIcon.svg";
import userIcon from "../../assets/userIcon.svg";
import tableIcon from "../../assets/tableIcon.png";
import addIcon from "../../assets/addIcon.svg";
import LobbyCard from "../lobby/lobbyCard";
import type { Lobby } from "../../types";
import "./home.css";

export default function HomePage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [lobbys, setLobbys] = useState<Lobby[]>([]);
    const [option, setOption] = useState<string>("table"); // si quieres que cargue mesas por defecto

    const backPort = import.meta.env.VITE_PORT_BACK;
    const authPort = import.meta.env.VITE_PORT_AUTH;

    // ✅ Verificar token UNA sola vez
    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        axios.post(`${authPort}/auth/verify`, { token })
            .then((res) => {
                if (!res.data.valid) navigate("/login");
            })
            .catch(() => navigate("/login"));
    }, [authPort, navigate, token]);

    const createNew = (option: string) => {
        switch (option) {
            case "user":
                alert("Crear user")
                break;
            case "table":
                alert("Crear table")
                break;
            case "admin":
                alert("Crear admin")
                break;
        }
    }

    // ✅ Cargar lobbys SOLO cuando option === "table" (y no en cada render)
    useEffect(() => {
        if (option !== "table") return;

        const ac = new AbortController();

        const load = async () => {
            try {
                const res = await axios.get(`${backPort}/api/tables/`, {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: ac.signal as any, // axios soporta AbortController moderno
                });
                setLobbys(res.data);
            } catch (err: any) {
                if (axios.isCancel(err)) return;
                console.error("Error al obtener los lobbys:", err);
            }
        };

        load();


        return () => ac.abort();
    }, [option, backPort, token]);

    return (
        <div className="home-page">
            <OptionBar />

            <div className="body_home">
                <div className="options_home">
                    <div onClick={() => setOption("user")} className="select_option">
                        <img src={userIcon} />
                        <p>Users</p>
                    </div>

                    <div onClick={() => setOption("admin")} className="select_option">
                        <img src={userIcon} />
                        <p>Admin</p>
                    </div>

                    <div onClick={() => setOption("table")} className="select_option">
                        <img className="table" src={tableIcon} />
                        <p>Tables</p>
                    </div>

                    <div onClick={() => setOption("top up")} className="select_option">
                        <img src={recargaIcon} />
                        <p>Top Up</p>
                    </div>

                    <div onClick={() => setOption("withdrawals")} className="select_option">
                        <img src={retiroIcon} />
                        <p>Withdrawals</p>
                    </div>
                    <hr />
                    {option === "user" || option === "table" || option === "admin" ? (
                        <div onClick={() => createNew(option)} className="create_new_option">
                            <img src={addIcon} />
                            <p>New {option}</p>
                        </div>) : null
                    }


                </div>

                <div className="option_selected_home">
                    {option === "table" ? (
                        lobbys.length > 0 ? (
                            <ul>
                                {lobbys.map((l) => (
                                    <LobbyCard
                                        key={l._id}
                                        lobby={l}
                                        onUpdated={(updated) => {
                                            setLobbys(prev => prev.map(x => x._id === updated._id ? updated : x));
                                        }}
                                    />
                                ))}
                            </ul>
                        ) : (
                            <p>No hay mesas disponibles.</p>
                        )
                    ) : option === "user" ? (
                        <p>Users...</p>
                    ) : option === "top up" ? (
                        <p>Top Up...</p>
                    ) : option === "withdrawals" ? (
                        <p>Withdrawals...</p>
                    ) : option === "admin" ? (
                        <p>Admins...</p>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
