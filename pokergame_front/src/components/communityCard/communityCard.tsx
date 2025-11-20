import { useEffect, useState } from "react";
import { cardImages } from "../../assets/cards/loader";
import "./communityCard.css";

type Props = {
    code: string;
};

export default function CommunityCard({ code }: Props) {
    // Lo que se está mostrando actualmente (para poder cambiarlo a mitad del flip)
    const [displayCode, setDisplayCode] = useState(code);
    const [isFlipping, setIsFlipping] = useState(false);

    useEffect(() => {
        // Si no cambió el código, no hacemos nada
        if (code === displayCode) return;

        // Empieza la animación
        setIsFlipping(true);

        // A mitad del giro cambiamos la cara de la carta
        const midTimeout = setTimeout(() => {
            setDisplayCode(code);
        }, 150); // la mitad de la duración del flip (si dura 300ms)

        // Al final del giro quitamos la clase
        const endTimeout = setTimeout(() => {
            setIsFlipping(false);
        }, 300);

        return () => {
            clearTimeout(midTimeout);
            clearTimeout(endTimeout);
        };
    }, [code, displayCode]);

    const src = cardImages[displayCode];

    return (
        <div className={`community-card-wrapper ${isFlipping ? "is-flipping" : ""}`}>
            <img src={src} alt={displayCode} className="community-card" />
        </div>
    );
}
