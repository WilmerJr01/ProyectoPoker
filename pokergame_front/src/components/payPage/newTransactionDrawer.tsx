import { useState, useMemo } from "react";
import axios from "axios";
import type { AxiosInstance } from "axios";
import "../lobby/lobbyCard.css"

type TxKind = "topup" | "withdrawal";

type Props = {
    open: boolean;
    kind: TxKind;
    onClose: () => void;
    onCreated: () => void;
};

export default function NewTransactionDrawer({ open, kind, onClose, onCreated }: Props) {
    const token = localStorage.getItem("token") || "";
    const PAY_BASE = import.meta.env.VITE_PORT_PAY ?? import.meta.env.VITE_PORT_BACK;

    const api: AxiosInstance = useMemo(() => {
        const a = axios.create({ baseURL: PAY_BASE });
        a.interceptors.request.use((config) => {
            if (token) config.headers.Authorization = `Bearer ${token}`;
            return config;
        });
        return a;
    }, [PAY_BASE, token]);

    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [form, setForm] = useState({
        userId: "",
        amount: 0,
        note: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
        }));
    };

    const handleCreate = async () => {
        if (!form.userId.trim() || Number(form.amount) <= 0) {
            setErrorMsg("userId y amount (> 0) son obligatorios.");
            return;
        }
        setSaving(true);
        setErrorMsg(null);

        try {
            // Rutas por defecto del microservicio de pagos:
            // topup      → POST /pay/payIn
            // withdrawal → POST /pay/payOut
            const path =
                kind === "topup" ? "/pay/payIn" : "/pay/payOut"; // <-- ajusta aquí si usas otro path

            await api.post(path, {
                userId: form.userId.trim(),
                amount: Number(form.amount),
                note: form.note.trim() || undefined,
            });

            onCreated();
        } catch (err: any) {
            setErrorMsg(err?.response?.data?.message || "Error al crear la operación");
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <div className="overlay">
            <div className="drawer">
                <div className="drawer__header">
                    <h3>New {kind === "topup" ? "Top Up" : "Withdrawal"}</h3>
                    <button className="drawer__close" onClick={onClose}>x</button>
                </div>

                <div className="drawer__content">
                    <div className="grid2">
                        <label>
                            <span>User ID</span>
                            <input
                                name="userId"
                                value={form.userId}
                                onChange={handleChange}
                                type="text"
                                placeholder="Usuario destino"
                            />
                        </label>

                        <label>
                            <span>Amount</span>
                            <input
                                name="amount"
                                value={form.amount}
                                onChange={handleChange}
                                type="number"
                                min={1}
                            />
                        </label>

                        <label>
                            <span>Note (optional)</span>
                            <input
                                name="note"
                                value={form.note}
                                onChange={handleChange}
                                type="text"
                                placeholder="Referencia o motivo"
                            />
                        </label>
                    </div>

                    {errorMsg && <p className="error">{errorMsg}</p>}
                </div>

                <div className="drawer__footer">
                    <button className="btn--primary" onClick={handleCreate} disabled={saving}>
                        {saving ? "Creating..." : "Create"}
                    </button>
                </div>
            </div>

            <div className="overlay__backdrop" onClick={onClose} />
        </div>
    );
}
