import { useEffect, useState } from "react";
import "../lobby/lobbyCard.css"; // Reutilizamos estilos
import axios from "axios";
import bcrypt from "bcryptjs";
import adminIcon from "../../assets/userIcon.svg" // Puedes cambiar a uno propio si quieres
import type { Admin } from "../../types";

type AdminCardProps = {
    admin: Admin;
    onUpdated?: (updated: Admin) => void;
};

export default function AdminCard({ admin, onUpdated }: AdminCardProps) {
    const token = localStorage.getItem("token");
    const API_BASE = import.meta.env.VITE_PORT_BACK ?? "http://localhost:5000";
    const ADMIN_BASE = `${API_BASE}/api/admin`;

    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: admin.name ?? "",
        lastName: admin.lastName ?? "",
        nickname: admin.nickname ?? "",
        password: "",
        rol: admin.rol ?? "",
    });

    useEffect(() => {
        setForm({
            name: admin.name ?? "",
            lastName: admin.lastName ?? "",
            nickname: admin.nickname ?? "",
            password: "",
            rol: admin.rol ?? "",
        });
    }, [admin]);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setErrorMsg(null);

        try {
            const payload: any = {
                name: form.name.trim(),
                lastName: form.lastName.trim(),
                nickname: form.nickname.trim(),
                rol: form.rol.trim(),
            };

            // Hashear la contraseña solo si se cambia
            if (form.password.trim()) {
                payload.password = await bcrypt.hash(form.password, 10);
            }

            const res = await axios.put(`${ADMIN_BASE}/${admin._id}`, payload, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });

            const updated: Admin = res.data;
            onUpdated?.(updated);
            setOpen(false);
        } catch (err: any) {
            setErrorMsg(err?.response?.data?.message || "Error al guardar los cambios");
        } finally {
            setSaving(false);
        }
    };

    const deleteAdmin = async () => {
        if (!confirm(`¿Seguro que deseas eliminar al admin "${admin.name}"?`)) return;

        try {
            await axios.delete(`${ADMIN_BASE}/${admin._id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            window.location.reload();
        } catch (err: any) {
            setErrorMsg(err?.response?.data?.message || "Error al eliminar el admin");
        }
    };

    return (
        <>
            <div className="body_Card">
                <div className="imgTable">
                    <img src={adminIcon} alt="Admin" />
                </div>

                <div className="infoTable">
                    <div className="nameTable">
                        <p>Name:</p>
                        <h2>
                            {admin.name} {admin.lastName}
                        </h2>
                    </div>
                    <p>Nickname: {admin.nickname}</p>
                    <p>Role: {admin.rol}</p>
                    <p>Tables: {admin.tables?.length ?? 0}</p>
                </div>

                <div className="entryBtn">
                    <button onClick={handleOpen}>Edit</button>
                    <button onClick={deleteAdmin}>Delete</button>
                </div>
            </div>

            {open && (
                <div className="overlay">
                    <div className="drawer">
                        <div className="drawer__header">
                            <h3>Edit Admin</h3>
                            <button className="drawer__close" onClick={handleClose}>
                                x
                            </button>
                        </div>

                        <div className="drawer__content">
                            <div className="grid2">
                                <label>
                                    <span>Name</span>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        type="text"
                                    />
                                </label>

                                <label>
                                    <span>Last Name</span>
                                    <input
                                        name="lastName"
                                        value={form.lastName}
                                        onChange={handleChange}
                                        type="text"
                                    />
                                </label>

                                <label>
                                    <span>Nickname</span>
                                    <input
                                        name="nickname"
                                        value={form.nickname}
                                        onChange={handleChange}
                                        type="text"
                                    />
                                </label>

                                <label>
                                    <span>Role</span>
                                    <input
                                        name="rol"
                                        value={form.rol}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder="e.g. superadmin"
                                    />
                                </label>

                                <label>
                                    <span>Password</span>
                                    <input
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        type="password"
                                        placeholder="New password (optional)"
                                    />
                                </label>
                            </div>

                            {errorMsg && <p className="error">{errorMsg}</p>}
                        </div>

                        <div className="drawer__footer">
                            <button
                                className="btn--primary"
                                onClick={handleSave}
                                disabled={saving}
                            >
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
