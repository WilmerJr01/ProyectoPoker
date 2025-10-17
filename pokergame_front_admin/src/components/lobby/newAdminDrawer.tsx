// src/components/admin/NewAdminDrawer.tsx
import { useState } from "react";
import axios from "axios";
import bcrypt from "bcryptjs";
import "../lobby/lobbyCard.css";

type NewAdminDrawerProps = {
    open: boolean;
    onClose: () => void;
    onCreated: () => void; // notifica al padre para refrescar la lista
};

export default function NewAdminDrawer({ open, onClose, onCreated }: NewAdminDrawerProps) {
    const token = localStorage.getItem("token");
    const API_BASE = import.meta.env.VITE_PORT_BACK ?? "http://localhost:5000";
    const ADMIN_BASE = `${API_BASE}/api/admin/`;

    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Campos según tu schema de Admin
    const [form, setForm] = useState({
        name: "",
        lastName: "",
        nickname: "",
        password: "",
        rol: "",
        tablesCsv: "", // opcional: IDs separados por coma si quieres asociar mesas al crear
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreate = async () => {
        // Validaciones mínimas
        if (!form.name.trim() || !form.lastName.trim() || !form.nickname.trim() || !form.password || !form.rol.trim()) {
            setErrorMsg("Name, Last Name, Nickname, Password y Rol son obligatorios.");
            return;
        }
        if (form.nickname.trim().length < 3) {
            setErrorMsg("Nickname debe tener al menos 3 caracteres.");
            return;
        }

        setSaving(true);
        setErrorMsg(null);

        try {
            // Hashear password en cliente (además puedes hashear en backend)
            const hashed = await bcrypt.hash(form.password, 10);

            // Parsear tables desde CSV (opcional)
            const tables =
                form.tablesCsv
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean); // lista de ObjectId en string

            const payload: any = {
                name: form.name.trim(),
                lastName: form.lastName.trim(),
                nickname: form.nickname.trim(),
                password: hashed,
                rol: form.rol.trim(),
            };

            if (tables.length > 0) payload.tables = tables;

            await axios.post(ADMIN_BASE, payload, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });

            onCreated(); // refresca lista
            onClose();   // cierra drawer
        } catch (err: any) {
            setErrorMsg(err?.response?.data?.message || "Error al crear el admin");
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <div className="overlay">
            <div className="drawer">
                <div className="drawer__header">
                    <h3>New Admin</h3>
                    <button className="drawer__close" onClick={onClose}>x</button>
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
                                placeholder="First name"
                            />
                        </label>

                        <label>
                            <span>Last Name</span>
                            <input
                                name="lastName"
                                value={form.lastName}
                                onChange={handleChange}
                                type="text"
                                placeholder="Last name"
                            />
                        </label>

                        <label>
                            <span>Nickname</span>
                            <input
                                name="nickname"
                                value={form.nickname}
                                onChange={handleChange}
                                type="text"
                                placeholder="Unique nickname"
                                minLength={3}
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
                                placeholder="Set initial password"
                            />
                        </label>

                        {/* Opcional: asociar mesas existentes por IDs separados por coma */}
                        <label>
                            <span>Tables (IDs, coma)</span>
                            <input
                                name="tablesCsv"
                                value={form.tablesCsv}
                                onChange={handleChange}
                                type="text"
                                placeholder="64f...a1, 64f...b2"
                            />
                        </label>
                    </div>

                    {errorMsg && <p className="error">{errorMsg}</p>}
                </div>

                <div className="drawer__footer">
                    <button className="btn--primary" onClick={handleCreate} disabled={saving}>
                        {saving ? "Creating..." : "Create Admin"}
                    </button>
                </div>
            </div>

            <div className="overlay__backdrop" onClick={onClose} />
        </div>
    );
}
