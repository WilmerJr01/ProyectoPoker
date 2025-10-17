import { useEffect, useState } from "react";
import "../lobby/lobbyCard.css";
import axios from "axios";
import userIcon from "../../assets/userIcon.svg";
import type { User } from "../../types";
import bcrypt from "bcryptjs"; // ✅ usar bcryptjs en el cliente

type UserCardProps = {
    user: User;
    onUpdated?: (updated: User) => void;
};

export default function UserCard({ user, onUpdated }: UserCardProps) {
    const token = localStorage.getItem("token");
    const API_BASE = import.meta.env.VITE_PORT_BACK ?? "http://localhost:5000";
    const USERS_BASE = `${API_BASE}/api/user`; // ← ajusta si tu ruta es /api/user

    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: user.name ?? "",
        lastName: user.lastName ?? "",
        birthDate: user.birthDate ? user.birthDate.substring(0, 10) : "",
        stack: user.stack ?? 10000,
        wins: user.wins ?? 0,
        totalGames: user.totalGames ?? 0,
        nickname: user.nickname ?? "",
        password: "", // ← editable; si queda vacío, no se envía
    });

    useEffect(() => {
        setForm({
            name: user.name ?? "",
            lastName: user.lastName ?? "",
            birthDate: user.birthDate ? user.birthDate.substring(0, 10) : "",
            stack: user.stack ?? 10000,
            wins: user.wins ?? 0,
            totalGames: user.totalGames ?? 0,
            nickname: user.nickname ?? "",
            password: "",
        });
    }, [user]);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]:
                name === "name" ||
                    name === "lastName" ||
                    name === "nickname" ||
                    name === "password"
                    ? value
                    : type === "number"
                        ? (value === "" ? "" : Number(value))
                        : value,
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setErrorMsg(null);
        try {
            // Construye el payload limpio
            const payload: any = {
                name: form.name.trim(),
                lastName: form.lastName.trim(),
                nickname: form.nickname.trim(),
                stack: Number(form.stack) || 0,
                wins: Number(form.wins) || 0,
                totalGames: Number(form.totalGames) || 0,
            };

            // birthDate a ISO si viene
            if (form.birthDate) {
                payload.birthDate = new Date(form.birthDate).toISOString();
            }

            // Hashear password SOLO si el usuario escribió algo nuevo
            if (form.password) {
                payload.password = await bcrypt.hash(form.password, 10);
            }

            const res = await axios.put(
                `${USERS_BASE}/${user._id}`,
                payload,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                }
            );

            const updated: User = res.data;
            onUpdated?.(updated);
            setOpen(false);
        } catch (err: any) {
            setErrorMsg(err?.response?.data?.message || "Error al guardar los cambios");
        } finally {
            setSaving(false);
        }
    };

    const deleteUser = async () => {
        if (!confirm(`¿Seguro que deseas eliminar al usuario "${user.name}"?`)) return;
        try {
            await axios.delete(`${USERS_BASE}/${user._id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            window.location.reload();
        } catch (err: any) {
            setErrorMsg(err?.response?.data?.message || "Error al eliminar el usuario");
        }
    };

    return (
        <>
            <div className="body_Card">
                <div className="imgTable">
                    <img src={userIcon} alt="User" />
                </div>

                <div className="infoTable">
                    <div className="nameTable">
                        <p>Name:</p>
                        <h2>{user.name} {user.lastName}</h2>
                    </div>
                    <p>Nickname: {user.nickname}</p>
                    <p>Stack: {user.stack}</p>
                    <p>Wins: {user.wins}</p>
                    <p>Total Games: {user.totalGames}</p>
                </div>

                <div className="entryBtn">
                    <button onClick={handleOpen}>Edit</button>
                    <button onClick={deleteUser}>Delete</button>
                </div>
            </div>

            {open && (
                <div className="overlay">
                    <div className="drawer">
                        <div className="drawer__header">
                            <h3>Edit User</h3>
                            <button className="drawer__close" onClick={handleClose}>x</button>
                        </div>

                        <div className="drawer__content">
                            <div className="grid2">
                                <label>
                                    <span>Name</span>
                                    <input name="name" value={form.name} onChange={handleChange} type="text" />
                                </label>

                                <label>
                                    <span>Last Name</span>
                                    <input name="lastName" value={form.lastName} onChange={handleChange} type="text" />
                                </label>

                                <label>
                                    <span>Nickname</span>
                                    <input name="nickname" value={form.nickname} onChange={handleChange} type="text" />
                                </label>

                                <label>
                                    <span>Birth Date</span>
                                    <input name="birthDate" value={form.birthDate} onChange={handleChange} type="date" />
                                </label>

                                <label>
                                    <span>Stack</span>
                                    <input name="stack" value={form.stack} onChange={handleChange} type="number" min={0} />
                                </label>

                                <label>
                                    <span>Wins</span>
                                    <input name="wins" value={form.wins} onChange={handleChange} type="number" min={0} />
                                </label>

                                <label>
                                    <span>Total Games</span>
                                    <input name="totalGames" value={form.totalGames} onChange={handleChange} type="number" min={0} />
                                </label>

                                <label>
                                    <span>Password</span>
                                    <input
                                        name="password"
                                        value={form.password} // ← nunca muestres hash aquí
                                        onChange={handleChange}
                                        type="password"
                                        placeholder="New password (optional)"
                                    />
                                </label>
                            </div>

                            {errorMsg && <p className="error">{errorMsg}</p>}
                        </div>

                        <div className="drawer__footer">
                            <button className="btn--primary" onClick={handleSave} disabled={saving}>
                                {saving ? "Saving..." : "Save changes"}
                            </button>
                        </div>
                    </div>

                    <div className="overlay__backdrop" onClick={handleClose} />
                </div>
            )}
        </>
    );
}
