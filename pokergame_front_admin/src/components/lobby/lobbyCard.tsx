// src/components/lobby/LobbyCard.tsx
import { useEffect, useState } from "react";
import "./lobbyCard.css";
import type { Lobby } from "../../types";
import tableIcon from "../../assets/tableIcon.png";
import financeIcon from "../../assets/financeIcon.svg";
import axios from "axios";

type LobbyCardProps = {
    lobby: Lobby;
    // Opcional: para refrescar la lista en el padre tras guardar
    onUpdated?: (updated: Lobby) => void;
};

export default function LobbyCard({ lobby, onUpdated }: LobbyCardProps) {
    const token = localStorage.getItem("token");
    const API_BASE = import.meta.env.VITE_PORT_BACK ?? "http://localhost:5000";

    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Estado del formulario (editable)
    const [form, setForm] = useState({
        name: lobby.name ?? "",
        maxPlayers: lobby.maxPlayers ?? 6,
        minBuyIn: lobby.minBuyIn ?? 0,
        maxBuyIn: lobby.maxBuyIn ?? 0,
        bigBlind: lobby.bigBlind ?? 0,
        smallBlind: lobby.smallBlind ?? 0,
    });

    // Mantén sincronizado si las props cambian
    useEffect(() => {
        setForm({
            name: lobby.name ?? "",
            maxPlayers: lobby.maxPlayers ?? 6,
            minBuyIn: lobby.minBuyIn ?? 0,
            maxBuyIn: lobby.maxBuyIn ?? 0,
            bigBlind: lobby.bigBlind ?? 0,
            smallBlind: lobby.smallBlind ?? 0,
        });
    }, [lobby]);

    const handleJoinClick = () => {
        setOpen(true);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]:
                name === "name" ? value : Number(value),
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setErrorMsg(null);
        try {
            const res = await axios.put(
                `${API_BASE}/api/tables/${lobby._id}`,
                {
                    name: form.name,
                    maxPlayers: form.maxPlayers,
                    minBuyIn: form.minBuyIn,
                    maxBuyIn: form.maxBuyIn,
                    bigBlind: form.bigBlind,
                    smallBlind: form.smallBlind,
                },
                {
                    headers: token
                        ? { Authorization: `Bearer ${token}` }
                        : undefined,
                }
            );

            const updated: Lobby = res.data;
            // Notifica al padre (Home) si pasó un callback
            onUpdated?.(updated);

            // Opcional: cierra el panel y refresca datos locales
            setOpen(false);
        } catch (err: any) {
            setErrorMsg(
                err?.response?.data?.message ||
                "Error al guardar los cambios"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="body_Card">
                <div className="imgTable">
                    <img src={tableIcon} alt="Table" />
                    <h2>{lobby.players.length}</h2>
                </div>

                <div className="infoTable">
                    <div className="nameTable">
                        <p>Name:</p>
                        <h2>{lobby.name}</h2>
                    </div>
                    <p>ID: {lobby._id}</p>
                    <p>Max Players: {lobby.maxPlayers}</p>
                    <div className="blindsTable">
                        <img src={financeIcon} alt="Blinds" />
                        <p>
                            {lobby.bigBlind} / {lobby.smallBlind}
                        </p>
                    </div>
                </div>

                <div className="entryBtn">
                    <button onClick={handleJoinClick}>
                        Edit
                    </button>
                    <button onClick={handleJoinClick}>
                        Delete
                    </button>
                </div>
            </div>

            {/* Overlay / Drawer */}
            {open && (
                <div className="overlay">
                    <div className="drawer">
                        <div className="drawer__header">
                            <h3>Edit Table</h3>
                            <button
                                className="drawer__close"
                                onClick={() => setOpen(false)}
                                aria-label="Close"
                            >
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
                                        max={10}
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

                            {errorMsg && (
                                <p className="error">{errorMsg}</p>
                            )}
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
                    {/* Clic fuera cierra */}
                    <div
                        className="overlay__backdrop"
                        onClick={() => setOpen(false)}
                    />
                </div>
            )}
        </>
    );
}
