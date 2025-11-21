import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import OptionBar from "../optionBar/optionBar";
import "./payment.css";
import NewTransactionDrawer from "./newTransactionDrawer.tsx";

type TxKind = "topup" | "withdrawal";

type PaymentTx = {
    _id: string;
    user: string;
    amount: number;
    kind: TxKind;
    notes?: string;
    createdAt?: string;
};

export default function PaymentsPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token") || "";
    const userId = localStorage.getItem("userId") || "";
    const [tab, setTab] = useState<TxKind>("topup");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [txs, setTxs] = useState<PaymentTx[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const AUTH_BASE = import.meta.env.VITE_PORT_AUTH;
    const PAY_BASE = import.meta.env.VITE_PORT_PAY; // 👉 debe ser "https://proyecto-poker-taupe.vercel.app"

    // 🔐 Verificar autenticación
    useEffect(() => {
        const verifyToken = async () => {
            if (!token || !userId) {
                navigate("/login");
                return;
            }

            try {
                const r = await axios.post(`${AUTH_BASE}/auth/verify`, { token });
                if (!r.data?.valid) {
                    navigate("/login");
                }
            } catch {
                navigate("/login");
            }
        };

        verifyToken();
    }, [token, userId, navigate, AUTH_BASE]);

    // 📥 Cargar transacciones del usuario según la pestaña
    const fetchTxs = async () => {
        if (!token || !userId) return;

        try {
            setLoading(true);
            setError(null);

            const r = await axios.get<PaymentTx[]>(
                // 🔥 AQUÍ el cambio importante
                `${PAY_BASE}/pay/${tab==="topup" ? "payIn":"payOut"}`,        // o `${PAY_BASE}/pay/payIn/` si tu ruta tiene barra final
                {
                    params: {
                        userId,      // solo movimientos del usuario logueado
                    },
                }
            );

            setTxs(r.data);
        } catch (err) {
            console.error(err);
            setError("No se pudieron cargar las operaciones.");
            setTxs([]);
        } finally {
            setLoading(false);
        }
    };

    // Cuando cambie la pestaña, recargar lista
    useEffect(() => {
        fetchTxs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab]);

    return (
        <div className="home-page">
            <OptionBar />

            <div className="body_payments">
                {/* Botón volver al Home */}
                <div className="back_home_container">
                    <button className="btn-back" onClick={() => navigate("/home")}>
                        ← Volver al Home
                    </button>
                </div>

                {/* Sidebar */}
                <aside className="options_home">
                    <div
                        className={`select_option ${tab === "topup" ? "active" : ""}`}
                        onClick={() => setTab("topup")}
                    >
                        <p>Top Up</p>
                    </div>

                    <div
                        className={`select_option ${tab === "withdrawal" ? "active" : ""}`}
                        onClick={() => setTab("withdrawal")}
                    >
                        <p>Withdrawals</p>
                    </div>

                    <hr />

                    <div
                        className="create_new_option"
                        onClick={() => setDrawerOpen(true)}
                    >
                        <p>New {tab === "topup" ? "Top Up" : "Withdrawal"}</p>
                    </div>
                </aside>

                {/* Contenido principal */}
                <main className="option_selected_home">
                    <h2>{tab === "topup" ? "Top Ups" : "Withdrawals"}</h2>

                    {loading && <p>Cargando operaciones...</p>}
                    {error && <p className="error">{error}</p>}

                    {!loading && !error && (
                        <>
                            {txs.length ? (
                                <ul className="txs">
                                    {txs.map((t) => (
                                        <li key={t._id} className="tx-card">
                                            <div className="tx-info">
                                                <div className="tx-type">
                                                    <span
                                                        className={`badge ${tab === "topup"
                                                                ? "badge--topup"
                                                                : "badge--withdrawal"
                                                            }`}
                                                    >
                                                        {tab}
                                                    </span>
                                                </div>

                                                <div
                                                    className={`tx-amount ${tab === "topup"
                                                            ? "tx-amount--topup"
                                                            : "tx-amount--withdrawal"
                                                        }`}
                                                >
                                                    {t.amount}
                                                </div>

                                                <div className="tx-meta">
                                                    <p>User: {t.user}</p>
                                                    {t.notes && <p>Note: {t.notes}</p>}
                                                    {t.createdAt && (
                                                        <p>
                                                            {new Date(
                                                                t.createdAt
                                                            ).toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No hay operaciones.</p>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Drawer */}
            <NewTransactionDrawer
                open={drawerOpen}
                kind={tab}
                onClose={() => setDrawerOpen(false)}
                onCreated={async () => {
                    setDrawerOpen(false);
                    await fetchTxs();
                }}
            />
        </div>
    );
}
