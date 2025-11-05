import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { createSocket, joinTable, leaveTable } from "../../socket";
import type { UserData, Seat, tableData } from "../../types";
import PokerTable from "./PokerTable";
import ChatWidget from "../chatwidget/chatwiget";
import "./table-page.css";

export default function TablePage() {
    const { id: tableId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId") || "";
    const tableData = JSON.parse(localStorage.getItem("tableData") || "null") as tableData | null;
    const [userData, setUserData] = useState<UserData | null>(null);
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

        axios.get(`${port}/auth/user/${userId}`).then((res) => {
            setUserData(res.data);
        });

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

    const seats: Seat[] = useMemo(() => {
        const maxSeats = tableData?.maxPlayers ?? 9;
        if (players.length === 0)
            return Array.from({ length: maxSeats }).map((_, i) => ({ seatIndex: i }));

        const heroIdx = players.findIndex((p) => p === userId);
        const ordered = heroIdx === -1 ? players : [...players.slice(heroIdx), ...players.slice(0, heroIdx)];

        return Array.from({ length: maxSeats }).map((_, i) => {
            let id;
            let nickname;
            let stack;
            axios.get(`${import.meta.env.VITE_PORT_AUTH}/auth/user/${ordered[i]}`).then((res) => {
                nickname = res.data.nickname;
                stack = res.data.stack;
                id = res.data.id;
            });
            const isHero = !!nickname && !!nickname && nickname === userData?.name;
            return { seatIndex: i, ordered[i], nickname, stack, isHero };
        });
    }, [players, tableData, userData?.name]);

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
