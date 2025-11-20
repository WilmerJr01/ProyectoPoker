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
    const [loader, setLoader] = useState(false);
    const { id: tableId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const tableData = JSON.parse(localStorage.getItem("tableData") || "null") as tableData | null;
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId") || "";
    const [nickname, setNickname] = useState<string>();

    const maxSeats = tableData?.maxPlayers ?? 9;
    const [pot, setPot] = useState<number>(0);
    const [bets, setBets] = useState<Record<string, number>>({});
    const [chips, setChips] = useState<Record<string, number>>({});

    const [community, setCommunity] = useState<string[]>([]);
    const [cards, setCards] = useState<Record<string, string[]>>({});

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

    useEffect(() => {
        const handleLoad = () => setLoader(true);

        if (document.readyState === "complete") {
            // La página YA está cargada
            setLoader(true);
            return;
        }

        window.addEventListener("load", handleLoad);

        return () => window.removeEventListener("load", handleLoad);
    }, []);


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
        const socket = socketRef.current!; // ⬅️ aquí sí usamos socket para eventos

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
            } else if (playerId === userId) {
                setIsMyTurn(true);
            }
        };

        socket.on("players:update", handlePlayersUpdate);

        const handlePotUpdate = (data: { tableId: string; pot: number }) => {
            if (!mounted) return;
            console.log("🔥 pot:update payload:", data);
            setPot(data.pot);
        };

        socket.on("pot:update", handlePotUpdate);

        socket.on("bets:update", (newBets: Record<string, number>) => {
            if (!mounted) return;
            console.log("bets:update", newBets);
            setBets(newBets);
        });

        socket.on("chips:update", (newChips: Record<string, number>) => {
            if (!mounted) return;
            console.log("chips:update", newChips);
            setChips(newChips);
        });

        socket.on("community:update", (newCommunity: string[]) => {
            if (!mounted) return;
            console.log("community:update", newCommunity);
            setCommunity(newCommunity);
        });

        socket.on("cards:update", (newCards: Record<string, string[]>) => {
            if (!mounted) return;
            setCards(newCards);
        });


        return () => {
            mounted = false;
            // salir de la mesa y limpiar listeners
            socket.off("community:update");
            socket.off("cards:update");
            socket.off("bets:update");
            socket.off("chips:update");
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

            const users = results.map((r) => (r.status === "fulfilled" ? r?.value.data : null));

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
                if (isHero) setNickname(u.nickname ?? " ")
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

    console.log("🔵 Render TablePage", { loader, seats, pot, bets, chips });

    return (
        <>
            {loader && socketRef.current ? (
                <div className="table-page page-felt-bg">
                    <header className="table-top">
                        <div className="table-name">
                            <h1>{tableData?.name.trim()}</h1>
                            <p>{tableData?.id}</p>
                        </div>
                        <button className="exit-btn" onClick={exit}>Exit</button>
                    </header>

                    <main className="table-main">
                        {seats ? <PokerTable seats={seats} pot={pot} chips={chips} bets={bets} community={community} cards={cards} /> : <div>Loading seats...</div>}
                    </main>

                    <nav className="action-bar">
                        <button className="btn action-fold" onClick={onFold} disabled={!isMyTurn}>Fold</button>
                        <button className="btn action-check" onClick={onCheck} disabled={!isMyTurn}>Check</button>
                        <button className="btn action-bet" onClick={onBet} disabled={!isMyTurn}>Bet</button>
                    </nav>
                </div>
            ) : (
                <div className="Cargando">Loading...</div>
            )}


            {/* Chat: montarlo LO ANTES POSIBLE */}
            {socketRef.current && tableId && (
                <ChatWidget
                    socket={socketRef.current}
                    tableId={tableId}
                    userId={userId}
                    nickname={nickname || "Jugador"}
                />
            )}
        </>
    );

}
