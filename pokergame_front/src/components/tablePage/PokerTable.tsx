import { memo, useMemo } from "react";
import type { PokerTableProps} from "../../types";
import "./poker-table.css";


function getInitial(name?: string) {
    return (name?.trim()?.[0] ?? "").toUpperCase();
}

function polarPositions(count: number) {
    const positions: { top: number; left: number }[] = [];
    const radiusX = 40;
    const radiusY = 30;
    for (let i = 0; i < count; i++) {
        const theta = (i / count) * Math.PI * 2 + Math.PI / 2; // el jugador 0 queda abajo
        const left = 50 + radiusX * Math.cos(theta);
        const top = 50 + radiusY * Math.sin(theta);
        positions.push({ top, left });
    }
    return positions;
}

function PokerTable({ seats }: PokerTableProps) {
    const positions = useMemo(() => polarPositions(seats.length || 9), [seats.length]);

    return (
        <div className="poker-wrap">
            <div className="felt">
                <div className="table-oval" />
                {seats.map((s, i) => {
                    const { top, left } = positions[i];
                    const occupied = Boolean(s.nickname);
                    return (
                        <div key={i} className={`seat ${s.isHero ? "hero-seat" : ""}`} style={{ top: `${top}%`, left: `${left}%` }}>
                            <div className={`avatar ${occupied ? "occupied" : "empty"}`}>
                                {occupied ? <span className="initial">{getInitial(s.nickname)}</span> : <span className="initial">+</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default memo(PokerTable);
