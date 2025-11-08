import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { createSocket, joinTable, leaveTable } from "../../socket";
import type { Seat, tableData } from "../../types";
import PokerTable from "./PokerTable";
import ChatWidget from "../chatwidget/chatwiget";
import "./table-page.css";

export default function TablePage() {
    const { id: tableId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const tableData = JSON.parse(localStorage.getItem("tableData") || "null") as tableData | null;

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId") || "";
    const [seats, setSeats] = useState<Seat[]>(() => {
        const maxSeats = tableData?.maxPlayers ?? 9;
        return Array.from({ length: maxSeats }).map((_, i) => ({
            id: "",
            nickname: "",
            stack: 0,
            isHero: false,
            seatIndex: i,
        }));
    });
    const [players, setPlayers] = useState<string[]>([]);
    const [isMyTurn, setIsMyTurn] = useState(false);

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        if (!tableId) return;

        const port = import.meta.env.VITE_PORT_AUTH;
        axios
            .post(`${port}/auth/verify`, { token })
            .then((res) => {
                if (!res.data.valid) navigate("/login");
            })
            .catch(() => navigate("/login"));

        const socket = createSocket();

        joinTable(tableId).then((res) => {
            if (!res.ok) {
                console.error("Error al unirse a la mesa:", res.error);
                return;
            }
            console.log(`✅ Usuario ${userId} unido a la mesa ${tableId}`);
        });

        socket.on("players:update", ({ players }: { tableId: string; players: string[] }) => {
            setPlayers(players);
        });

        socket.on("turn:active", ({ playerId }: { playerId: string }) => {
            setIsMyTurn(playerId === userId);
        });

        return () => {
            leaveTable(tableId);
            socket.off("players:update");
            socket.off("turn:active");
        };
    }, [tableId, navigate, token, userId]);

    useEffect(() => {
        let mounted = true;
        const maxSeats = tableData?.maxPlayers ?? 9;

        if (players.length === 0) {
            if (mounted) {
                setSeats(
                    Array.from({ length: maxSeats }).map((_, i) => ({
                        id: "",
                        nickname: "",
                        stack: 0,
                        isHero: false,
                        seatIndex: i,
                    }))
                );
            }
            return () => {
                mounted = false;
            };
        }

        const heroIdx = players.findIndex((p) => p === userId);
        const ordered = heroIdx === -1 ? players : [...players.slice(heroIdx), ...players.slice(0, heroIdx)];

        (async () => {
            const fetched = await Promise.all(
                ordered.map(async (pid) => {
                    try {
                        const res = await axios.get(`${import.meta.env.VITE_PORT_AUTH}/auth/user/${pid}`);
                        return res.data;
                    } catch {
                        return null;
                    }
                })
            );

            const seatsArr: Seat[] = Array.from({ length: maxSeats }).map((_, i) => {
                const u = fetched[i];
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
                    id: u._id,
                    nickname: u.nickname ?? "",
                    stack: u.stack ?? 0,
                    isHero,
                    seatIndex: i,
                };
            });

            if (mounted) setSeats(seatsArr);
        })();

        return () => {
            mounted = false;
        };
    }, [players, tableData?.maxPlayers, userId]);

    const onFold = () => createSocket().emit("action:send", { tableId, action: "fold" });
    const onCheck = () => createSocket().emit("action:send", { tableId, action: "check" });
    const onBet = () => {
        const size = prompt("Bet size (chips)", "0");
        const amount = Number(size ?? 0) || 0;
        createSocket().emit("action:send", { tableId, action: "bet", amount });
    };

    return (
        <div className="table-page page-felt-bg">
            <header className="table-top">
                <div className="top-left-spacer" />
                <h1 className="table-name">{tableId}</h1>
                <button className="exit-btn" onClick={() => navigate("/home")}>Exit</button>
            </header>

            <main className="table-main">
                <PokerTable seats={seats} />
            </main>

            <nav className="action-bar">
                <button className="btn action-fold" onClick={onFold} disabled={!isMyTurn}>Fold</button>
                <button className="btn action-check" onClick={onCheck} disabled={!isMyTurn}>Check</button>
                <button className="btn action-bet" onClick={onBet} disabled={!isMyTurn}>Bet</button>
            </nav>

            {/* 👇 Chat abajo a la derecha */}
            <ChatWidget tableId={tableId || ""} userId={userId} />
        </div>
    );
}
