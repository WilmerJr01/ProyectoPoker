import { useState } from "react";
import axios from "axios";
// ⬇️ Usa bcryptjs en el navegador
import bcrypt from "bcryptjs";
import "../lobby/lobbyCard.css";

type NewUserDrawerProps = {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
};

export default function NewUserDrawer({ open, onClose, onCreated }: NewUserDrawerProps) {
    const token = localStorage.getItem("token");
    const API_BASE = import.meta.env.VITE_PORT_BACK ?? "http://localhost:5000";

    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: "",
        lastName: "",
        birthDate: "",   // yyyy-mm-dd
        stack: 10000,
        wins: 0,
        totalGames: 0,
        nickname: "",
        password: "",    // ← guarda texto aquí
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
        }));
    };

    const handleCreate = async () => {
        if (!form.name.trim() || !form.lastName.trim() || !form.nickname.trim() || !form.password) {
            setErrorMsg("Nombre, Apellido, Nickname y Password son obligatorios.");
            return;
        }
        if (!form.birthDate) {
            setErrorMsg("La fecha de nacimiento es obligatoria.");
            return;
        }
        if ([form.stack, form.wins, form.totalGames].some((n: any) => Number(n) < 0)) {
            setErrorMsg("Stack, Wins y TotalGames deben ser >= 0.");
            return;
        }

        setSaving(true);
        setErrorMsg(null);

        try {
            const birthISO = new Date(form.birthDate).toISOString();

            // ✅ OPCIÓN A (recomendada): enviar password en texto y hashear en el backend
            // const payload = { ...form, birthDate: birthISO };

            // ✅ OPCIÓN B (si quieres hashear en el cliente): usa bcryptjs aquí
            const hashed = await bcrypt.hash(form.password, 10);
            const payload = {
                name: form.name.trim(),
                lastName: form.lastName.trim(),
                birthDate: birthISO,
                stack: Number(form.stack) || 0,
                wins: Number(form.wins) || 0,
                totalGames: Number(form.totalGames) || 0,
                nickname: form.nickname.trim(),
                password: hashed, // ← manda el hash
            };

            await axios.post(`${API_BASE}/api/user/`, payload, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });

            onCreated();
            onClose();
        } catch (err: any) {
            setErrorMsg(err?.response?.data?.message || "Error al crear el usuario");
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <div className="overlay">
            <div className="drawer">
                <div className="drawer__header">
                    <h3>New User</h3>
                    <button className="drawer__close" onClick={onClose}>x</button>
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
                            <input name="nickname" value={form.nickname} onChange={handleChange} type="text" minLength={3} />
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
                            {/* ⬇️ Mantén el valor en texto; NO muestres el hash en el input */}
                            <input name="password" value={form.password} onChange={handleChange} type="password" placeholder="Set initial password" />
                        </label>
                    </div>

                    {errorMsg && <p className="error">{errorMsg}</p>}
                </div>

                <div className="drawer__footer">
                    <button className="btn--primary" onClick={handleCreate} disabled={saving}>
                        {saving ? "Creating..." : "Create User"}
                    </button>
                </div>
            </div>

            <div className="overlay__backdrop" onClick={onClose} />
        </div>
    );
}
