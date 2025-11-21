import { memo, useMemo } from "react";
import type { PokerTableProps } from "../../types";
import "./poker-table.css";
import CommunityCard from "../communityCard/communityCard";
import dealerImg from "../../assets/dealer.webp";

function getInitial(name?: string) {
    return (name?.trim()?.[0] ?? "").toUpperCase();
}

function polarPositions(count: number) {
    const positions: { top: number; left: number }[] = [];
    const radiusX = 40;  // ancho de la mesa
    const radiusY = 30;  // alto de la mesa

    // knobs (ajústalos a gusto)
    const k = 0.20;  // cuánto comprimir X en la parte de arriba
    const m = 0.35;  // cuánto estirar Y en los lados
    const p = 1.2;   // curva de compresión arriba (suaviza/durece)
    const q = 1.0;   // curva de estiramiento en los lados

    for (let i = 0; i < count; i++) {
        const theta = (i / count) * Math.PI * 2 + Math.PI / 2;

        const s = Math.sin(theta);
        const c = Math.cos(theta);

        const compressTopX = 1 - k * Math.pow(Math.max(0, -s), p);
        const stretchSideY = 1 + m * Math.pow(Math.abs(c), q);

        const left = 50 + radiusX * c * compressTopX;
        const top = 50 + radiusY * s * stretchSideY;

        positions.push({ top, left });
    }
    return positions;
}

function PokerTable({ seats, pot, bets, chips, community, cards, dealer, show }: PokerTableProps) {
    const positions = useMemo(() => polarPositions(seats.length || 9), [seats.length]);
    const communityCards = Array(5).fill("CC").map((_, i) => community[i] ?? "CC");

    return (
        <div className="poker-wrap">
            <div className="felt">
                <div className="table-oval" />
                <div className="pot-display">Pot: {pot}</div>

                <div className="community-cards">
                    {communityCards.map((cardCode, i) => (
                        <CommunityCard key={i} code={cardCode} />
                    ))}
                </div>

                {seats.map((s, i) => {
                    const { top, left } = positions[i];
                    const occupied = Boolean(s.nickname);
                    const bet = bets[s.id] ?? 0;
                    const chipCount = chips[s.id] ?? 0;

                    // Mano real que viene del servidor
                    const hand = cards[s.id] ?? [];
                    let visibleHand
                    // 👇 Solo el héroe ve sus cartas reales, los demás siempre ven CC
                    if (show){
                        visibleHand = hand
                    } else {
                        visibleHand = s.isHero ? [hand[0] ?? "CC", hand[1] ?? "CC"]: ["CC", "CC"];
                    }

                    return (
                        <div
                            key={i}
                            className={`seat ${s.isHero ? "hero-seat" : ""}`}
                            style={{ top: `${top}%`, left: `${left}%` }}
                        >
                            <div className={`avatar ${occupied ? "occupied" : "empty"}`}>
                                {occupied
                                    ? <span className="initial">{getInitial(s.nickname)}</span>
                                    : <span className="initial">+</span>}
                            </div>

                            <div className="seat-info">
                                <div className="top-seat">
                                    {dealer && dealer === s.id && (
                                        <img className="dealer" src={dealerImg} alt="dealer" />
                                    )}
                                    <div className="nickname">{s.nickname || "Empty"}</div>
                                </div>

                                <div className="stack">Stack: {chipCount}</div>
                                {bet > 0 && <div className="bet-amount">Bet: {bet}</div>}

                                {occupied && (
                                    <div className="person-cards">
                                        {visibleHand.map((cardCode, idx) => (
                                            <CommunityCard key={idx} code={cardCode} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default memo(PokerTable);
