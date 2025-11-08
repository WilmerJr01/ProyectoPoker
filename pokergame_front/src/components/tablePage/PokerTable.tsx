import { memo, useMemo } from "react";
import type { PokerTableProps } from "../../types";
import "./poker-table.css";


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

        // Top = sin(theta) < 0 → comprimir X hacia el centro
        const compressTopX = 1 - k * Math.pow(Math.max(0, -s), p);

        // Lados = |cos(theta)| ~ 1 → estirar Y para separarlos verticalmente
        const stretchSideY = 1 + m * Math.pow(Math.abs(c), q);

        const left = 50 + radiusX * c * compressTopX;
        const top = 50 + radiusY * s * stretchSideY;

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
