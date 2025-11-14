import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { createSocket, joinTable, leaveTable } from "../../socket";
import type { Seat, tableData } from "../../types";
import PokerTable from "./PokerTable";
// ojo al nombre del archivo; si se llama chatwidget/chatwidget.tsx, corrige el import
import ChatWidget from "../chatwidget/chatwiget.tsx";
import "./table-page.css";

export default function TablePage() {
    const { id: tableId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const tableData = JSON.parse(localStorage.getItem("tableData") || "null") as tableData | null;
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId") || "";

    const maxSeats = tableData?.maxPlayers ?? 9;

    const [players, setPlayers] = useState<string[]>([]);
    const [seats, setSeats] = useState<Seat[]>(
        () =>
            Array.from({ length: maxSeats }).map((_, i) => ({
                id: "",
                nickname: "",
                stack: 0,
                isHero: false,
                seatIndex: i,
            })) as Seat[]
    );
    const [isMyTurn, setIsMyTurn] = useState(false);

    // una sola instancia de socket para toda la vida del componente
    const socketRef = useRef<ReturnType<typeof createSocket> | null>(null);

    // efecto de autenticación + conexión socket + suscripción a eventos
    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        if (!tableId) return;

        const authBase = import.meta.env.VITE_PORT_AUTH;
        if (!authBase) {
            console.error("❌ VITE_PORT_AUTH no está definido");
            navigate("/login");
            return;
        }

        let mounted = true;

        axios
            .post(`${authBase}/auth/verify`, { token })
            .then((res) => {
                if (!res.data?.valid) navigate("/login");
            })
            .catch(() => navigate("/login"));

        // crear socket (si no existe todavía)
        if (!socketRef.current) {
            socketRef.current = createSocket();
        }
        const socket = socketRef.current;

        // unirse a la mesa
        joinTable(tableId).then((res) => {
            if (!res.ok) {
                console.error("Error al unirse a la mesa:", res.error);
                return;
            }
            console.log(`✅ Usuario ${userId} unido a la mesa ${tableId}`);
        });

        // handlers en variables para poder removerlos luego
        const handlePlayersUpdate = ({ players: p }: { tableId: string; players: string[] }) => {
            if (!mounted) return;
            setPlayers(p);
        };

        const handleTurnActive = ({ playerId }: { playerId: string }) => {
            if (!mounted) return;
            if (!playerId || playerId === "" || playerId !== userId) {
                setIsMyTurn(false);
                return;
            } else if (playerId === userId){
                setIsMyTurn(true);
            }
        };

        socket.on("players:update", handlePlayersUpdate);
        socket.on("turn:active", handleTurnActive);

        return () => {
            mounted = false;
            // salir de la mesa y limpiar listeners
            leaveTable(tableId);
            socket.off("players:update", handlePlayersUpdate);
            socket.off("turn:active", handleTurnActive);
        };
    }, [tableId, token, userId, navigate]);

    // ordenar jugadores para que el héroe quede en el índice 0 (abajo)
    const orderedPlayers = useMemo(() => {
        if (!players.length) return players;
        const heroIdx = players.findIndex((p) => p === userId);
        return heroIdx === -1 ? players : [...players.slice(heroIdx), ...players.slice(0, heroIdx)];
    }, [players, userId]);

    // poblar asientos con la info de usuario (nickname/stack/isHero)
    useEffect(() => {
        let alive = true;

        if (!orderedPlayers.length) {
            // reset placeholders si no hay jugadores
            setSeats(
                Array.from({ length: maxSeats }).map((_, i) => ({
                    id: "",
                    nickname: "",
                    stack: 0,
                    isHero: false,
                    seatIndex: i,
                }))
            );
            return;
        }

        const authBase = import.meta.env.VITE_PORT_AUTH;
        if (!authBase) {
            console.error("❌ VITE_PORT_AUTH no está definido");
            return;
        }

        (async () => {
            const results = await Promise.allSettled(
                orderedPlayers.map((pid) => axios.get(`${authBase}/auth/user/${pid}`))
            );

            const users = results.map((r) => (r.status === "fulfilled" ? r.value.data : null));

            const nextSeats: Seat[] = Array.from({ length: maxSeats }).map((_, i) => {
                const u = users[i];
                if (!u) {
                    return {
                        id: "",
                        nickname: "",
                        stack: 0,
                        isHero: false,
                        seatIndex: i,
                    };
                }
                const isHero = u._id === userId;
                return {
                    id: u._id ?? "",
                    nickname: u.nickname ?? "",
                    stack: u.stack ?? 0,
                    isHero,
                    seatIndex: i,
                };
            });

            if (alive) setSeats(nextSeats);
        })();

        return () => {
            alive = false;
        };
    }, [orderedPlayers, maxSeats, userId]);

    // acciones: reusar el MISMO socket
    const emitAction = (payload: any) => {
        if (!socketRef.current) return;
        socketRef.current.emit("action:send", payload);
    };

    const onFold = () => emitAction({ tableId, action: "fold" });
    const onCheck = () => emitAction({ tableId, action: "check" });
    const onBet = () => {
        const size = prompt("Bet size (chips)", "0");
        const amount = Number(size ?? 0) || 0;
        emitAction({ tableId, action: "bet", amount });
    };

    const exit = async () => {
        if (tableId) await leaveTable(tableId);
        navigate("/home");
    };

    return (
        <div className="table-page page-felt-bg">
            <header className="table-top">
                <div className="top-left-spacer" />
                <h1 className="table-name">{tableId}</h1>
                <button className="exit-btn" onClick={exit}>Exit</button>
            </header>

            <main className="table-main">
                <PokerTable seats={seats} />
            </main>

            <nav className="action-bar">
                <button className="btn action-fold" onClick={onFold} disabled={!isMyTurn}>Fold</button>
                <button className="btn action-check" onClick={onCheck} disabled={!isMyTurn}>Check</button>
                <button className="btn action-bet" onClick={onBet} disabled={!isMyTurn}>Bet</button>
            </nav>

            {/* Chat abajo a la derecha */}
            <ChatWidget tableId={tableId || ""} userId={userId} />
        </div>
    );
}
