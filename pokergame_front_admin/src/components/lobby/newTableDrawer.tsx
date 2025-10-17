// src/components/lobby/NewTableDrawer.tsx
import { useState } from "react";
import axios from "axios";
import "./lobbyCard.css"; // reutilizamos estilos

type NewTableDrawerProps = {
    open: boolean;
    onClose: () => void;
    onCreated: () => void; // notifica al padre que refresque
};

export default function NewTableDrawer({ open, onClose, onCreated }: NewTableDrawerProps) {
    const token = localStorage.getItem("token");
    const API_BASE = import.meta.env.VITE_PORT_BACK ?? "http://localhost:5000";

    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: "",
        maxPlayers: 6,
        minBuyIn: 0,
        maxBuyIn: 0,
        bigBlind: 200,
        smallBlind: 100,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "name" ? value : Number(value),
        }));
    };

    const handleCreate = async () => {
        setSaving(true);
        setErrorMsg(null);
        try {
            await axios.post(
                `${API_BASE}/api/tables/`,
                {
                    name: form.name,
                    maxPlayers: form.maxPlayers,
                    minBuyIn: form.minBuyIn,
                    maxBuyIn: form.maxBuyIn,
                    bigBlind: form.bigBlind,
                    smallBlind: form.smallBlind,
                },
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                }
            );

            onCreated(); // 🔄 refresca la lista del padre
            onClose(); // cierra el drawer
        } catch (err: any) {
            setErrorMsg(err?.response?.data?.message || "Error al crear la mesa");
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <div className="overlay">
            <div className="drawer">
                <div className="drawer__header">
                    <h3>New Table</h3>
                    <button className="drawer__close" onClick={onClose}>
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
                                placeholder="Table name"
                            />
                        </label>

                        <label>
                            <span>Max Players</span>
                            <input
                                name="maxPlayers"
                                value={form.maxPlayers}
                                onChange={handleChange}
                                type="number"
                                min={2}
                                max={9}
                            />
                        </label>

                        <label>
                            <span>Min Buy-in</span>
                            <input
                                name="minBuyIn"
                                value={form.minBuyIn}
                                onChange={handleChange}
                                type="number"
                                min={0}
                            />
                        </label>

                        <label>
                            <span>Max Buy-in</span>
                            <input
                                name="maxBuyIn"
                                value={form.maxBuyIn}
                                onChange={handleChange}
                                type="number"
                                min={0}
                            />
                        </label>

                        <label>
                            <span>Big Blind</span>
                            <input
                                name="bigBlind"
                                value={form.bigBlind}
                                onChange={handleChange}
                                type="number"
                                min={0}
                            />
                        </label>

                        <label>
                            <span>Small Blind</span>
                            <input
                                name="smallBlind"
                                value={form.smallBlind}
                                onChange={handleChange}
                                type="number"
                                min={0}
                            />
                        </label>
                    </div>

                    {errorMsg && <p className="error">{errorMsg}</p>}
                </div>

                <div className="drawer__footer">
                    <button className="btn--primary" onClick={handleCreate} disabled={saving}>
                        {saving ? "Creating..." : "Create Table"}
                    </button>
                </div>
            </div>

            <div className="overlay__backdrop" onClick={onClose} />
        </div>
    );
}
