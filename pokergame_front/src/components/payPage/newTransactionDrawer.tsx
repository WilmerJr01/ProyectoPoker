import { useState, useMemo, type ChangeEvent } from "react";
import axios, { type AxiosInstance } from "axios";
import "./newTransaction.css";

type TxKind = "topup" | "withdrawal";

type Props = {
    open: boolean;
    kind: TxKind;
    onClose: () => void;
    onCreated: () => void;
};

type FormState = {
    amount: string;
    cardNumber: string;
    notes: string;
};

export default function NewTransactionDrawer({
    open,
    kind,
    onClose,
    onCreated,
}: Props) {
    const token = localStorage.getItem("token") || "";
    const PAY_BASE =
        import.meta.env.VITE_PORT_PAY ?? import.meta.env.VITE_PORT_BACK;

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

    const [form, setForm] = useState<FormState>({
        amount: "",
        cardNumber: "",
        notes: "",
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreate = async () => {
        const amountNum = Number(form.amount);

        if (!amountNum || amountNum <= 0) {
            setErrorMsg("amount (> 0) es obligatorio.");
            return;
        }

        if (kind === "topup" && !form.cardNumber.trim()) {
            setErrorMsg("Para Top Up, cardNumber es obligatorio.");
            return;
        }

        // obtenemos valores obligatorios
        const user = localStorage.getItem("userId") || "";
        const tokenLS = localStorage.getItem("token") || "";
        // OJO: dime si esto existe o si debo pedirlo por API

        if (!user || !tokenLS) {
            setErrorMsg("No hay usuario o token en localStorage.");
            return;
        }

        setSaving(true);
        setErrorMsg(null);

        try {
            const path = `/pay/${kind ==="topup" ? "payIn" : "payOut"}`;

            const payload = {
                user,
                amount: amountNum,
                cardNumber: form.cardNumber.trim(),
                notes: form.notes.trim() || null,
                token: tokenLS
            };

            console.log("ENVIANDO:", payload);

            await api.post(path, payload);

            onCreated();
        } catch (err: any) {
            console.error("ERROR:", err?.response?.data);
            setErrorMsg(err?.response?.data?.message || "Error al crear operación");
        } finally {
            setSaving(false);
        }
    };


    if (!open) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-window">
                <div className="modal-header">
                    <h3>New {kind === "topup" ? "Top Up" : "Withdrawal"}</h3>
                    <button className="modal-close" onClick={onClose}>x</button>
                </div>

                <div className="modal-content">
                    <div className="grid2">
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

                        {kind === "topup" && (
                            <label>
                                <span>Card Number</span>
                                <input
                                    name="cardNumber"
                                    value={form.cardNumber}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="XXXX-XXXX-XXXX-XXXX"
                                />
                            </label>
                        )}

                        <label>
                            <span>Notes (optional)</span>
                            <input
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                type="text"
                                placeholder="Referencia o motivo"
                            />
                        </label>
                    </div>

                    {errorMsg && <p className="error">{errorMsg}</p>}
                </div>

                <div className="modal-footer">
                    <button
                        className="btn--primary"
                        onClick={handleCreate}
                        disabled={saving}
                    >
                        {saving ? "Creating..." : "Create"}
                    </button>
                </div>
            </div>
        </div>
    );
}
