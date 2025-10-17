import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import OptionBar from "../optionBar/optionBar";
import LobbyCard from "../lobby/lobbyCard";
import NewTableDrawer from "../lobby/newTableDrawer"; // 👈 importar nuevo componente
import NewUserDrawer from "../lobby/newUserDrawer";
import NewAdminDrawer from "../lobby/newAdminDrawer";
import retiroIcon from "../../assets/retirosIcon.svg";
import recargaIcon from "../../assets/recargaIcon.svg";
import userIcon from "../../assets/userIcon.svg";
import tableIcon from "../../assets/tableIcon.png";
import addIcon from "../../assets/addIcon.svg";
import UserCard from "../user/userCard";
import AdminCard from "../admin/adminCard";
import type { Lobby, User, Admin } from "../../types";
import "./home.css";

export default function HomePage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [lobbys, setLobbys] = useState<Lobby[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [option, setOption] = useState<string>(" ");
    const [drawerOpen1, setDrawerOpen1] = useState(false); // 👈 estado para el drawer
    const [drawerOpen2, setDrawerOpen2] = useState(false); // 👈 estado para el drawer
    const [drawerOpen3, setDrawerOpen3] = useState(false); // 👈 estado para el drawer



    const backPort = import.meta.env.VITE_PORT_BACK;
    const authPort = import.meta.env.VITE_PORT_AUTH;

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

    const fetchLobbys = async () => {
        try {
            const res = await axios.get(`${backPort}/api/tables/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLobbys(res.data);
        } catch (err) {
            console.error("Error al obtener los lobbys:", err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${backPort}/api/user/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(res.data);
        } catch (err) {
            console.error("Error al obtener los lobbys:", err);
        }
    }

    const fetchAdmins = async () => {
        try {
            const res = await axios.get(`${backPort}/api/admin/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAdmins(res.data)
        } catch (err) {
            console.error("Error al obtener los admin:", err);

        }
    }

    useEffect(() => {
        if (option === "table") fetchLobbys();
        if (option === "user") fetchUsers();
        if (option === "admin") fetchAdmins();
    }, [option]);

    const createNew = (option: string) => {
        if (option === "table") setDrawerOpen1(true);
        if (option === "user") setDrawerOpen2(true);
        if (option == "admin") setDrawerOpen3(true);
    };

    return (
        <div className="home-page">
            <OptionBar />

            <div className="body_home">
                <div className="options_home">
                    {/* opciones */}
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

                    {["user", "table", "admin"].includes(option) && (
                        <div onClick={() => createNew(option)} className="create_new_option">
                            <img src={addIcon} />
                            <p>New {option}</p>
                        </div>
                    )}
                </div>

                <div className="option_selected_home">
                    {option === "table" ? (
                        lobbys.length > 0 ? (
                            <ul>
                                {lobbys.map((l) => (
                                    <LobbyCard
                                        key={l._id}
                                        lobby={l}
                                        onUpdated={() => fetchLobbys()}
                                    />
                                ))}
                            </ul>
                        ) : (
                            <p>No table register</p>
                        )
                    ) : option === "user" ? (
                        users.length > 0 ? (
                            <ul>
                                {users.map((u) => (
                                    <UserCard key={u._id} user={u} onUpdated={fetchUsers} />
                                ))}
                            </ul>
                        ) : (
                            <p>No user register</p>
                        )

                    ) : option === "top up" ? (
                        <p>Top Up...</p>
                    ) : option === "withdrawals" ? (
                        <p>Withdrawals...</p>
                    ) : option === "admin" ? (
                        (
                            admins.length > 0 ? (
                                <ul>
                                    {admins.map((a) => (
                                        <AdminCard
                                            key={a._id}
                                            admin={a}
                                            onUpdated={(updated) =>
                                                setAdmins((prev) =>
                                                    prev.map((x) => (x._id === updated._id ? updated : x))
                                                )
                                            }
                                        />
                                    ))}
                                </ul>
                            ) : (
                                <p >No admin register</p>
                            )
                        )
                    ) : <h1>Select option...</h1>}
                </div>
            </div>

            {/* Drawer para crear mesa */}
            <NewTableDrawer open={drawerOpen1} onClose={() => setDrawerOpen1(false)} onCreated={fetchLobbys} />
            <NewUserDrawer open={drawerOpen2} onClose={() => (setDrawerOpen2(false))} onCreated={fetchUsers} />
            <NewAdminDrawer open={drawerOpen3} onClose={() => (setDrawerOpen3(false))} onCreated={fetchAdmins} />

        </div>
    );
}
