import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import OptionBar from "../optionBar/optionBar";
import "./payment.css";
import NewTransactionDrawer from "./newTransactionDrawer.tsx";

type TxKind = "topup" | "withdrawal";

type PaymentTx = {
    _id: string;
    userId: string;
    amount: number;
    kind: TxKind;
    note?: string;
    createdAt?: string;
};

export default function PaymentsPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token") || "";
    const [tab, setTab] = useState<TxKind>("topup");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [txs, setTxs] = useState<PaymentTx[]>([]);

    const AUTH_BASE = import.meta.env.VITE_PORT_AUTH;

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        axios
            .post(`${AUTH_BASE}/auth/verify`, { token })
            .then((r) => {
                if (!r.data?.valid) navigate("/login");
            })
            .catch(() => navigate("/login"));
    }, []);

    //

    /*useEffect(() => {
        fetchTxs(tab);
    }, [tab]);
*/
    return (
        <div className="home-page">
            <OptionBar />

            <div className="body_home">
                {/* 🔙 Botón volver al Home */}
                <div className="back_home_container">
                    <button className="btn-back" onClick={() => navigate("/home")}>
                        ← Volver al Home
                    </button>
                </div>

                <div className="options_home">
                    <div
                        onClick={() => setTab("topup")}
                        className="select_option"
                        style={{ opacity: tab === "topup" ? 1 : 0.6 }}
                    >
                        <p>Top Up</p>
                    </div>
                    <div
                        onClick={() => setTab("withdrawal")}
                        className="select_option"
                        style={{ opacity: tab === "withdrawal" ? 1 : 0.6 }}
                    >
                        <p>Withdrawals</p>
                    </div>
                    <hr />
                    <div
                        onClick={() => setDrawerOpen(true)}
                        className="create_new_option"
                    >
                        <p>New {tab === "topup" ? "Top Up" : "Withdrawal"}</p>
                    </div>
                </div>

                <div className="option_selected_home">
                    <h2 style={{ marginBottom: 10 }}>
                        {tab === "topup" ? "Top Ups" : "Withdrawals"}
                    </h2>

                    {txs.length ? (
                        <ul className="txs">
                            {txs.map((t) => (
                                <li key={t._id} className="tx-card">
                                    <div className="tx-info">
                                        <div className="tx-type">
                                            <span
                                                className={`badge ${t.kind === "topup"
                                                    ? "badge--topup"
                                                    : "badge--withdrawal"
                                                    }`}
                                            >
                                                {t.kind}
                                            </span>
                                        </div>

                                        <div
                                            className={`tx-amount ${t.kind === "topup"
                                                ? "tx-amount--topup"
                                                : "tx-amount--withdrawal"
                                                }`}
                                        >
                                            {t.amount}
                                        </div>

                                        <div className="tx-meta">
                                            <p>User: {t.userId}</p>
                                            {t.note ? <p>Note: {t.note}</p> : null}
                                            {t.createdAt ? (
                                                <p>{new Date(t.createdAt).toLocaleString()}</p>
                                            ) : null}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No hay operaciones.</p>
                    )}
                </div>
            </div>

            <NewTransactionDrawer
                open={drawerOpen}
                kind={tab}
                onClose={() => setDrawerOpen(false)}
                onCreated={() => {
                    setDrawerOpen(false);
                }}
            />
        </div>
    );
}
