import { useEffect } from "react";
import './menuInfo.css';

type UserData = {
    name: string;
    lastName: string;
    nickname: string;
    birthDate: Date;
    stack: number;
    wins: number;
    totalGames: number;
};

export default function MenuInfo({ user, onClose, }: { user: UserData; onClose: () => void; }) {
    // Cerrar con ESC
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div className="menu-info-content">
            <button className="close-drawer" onClick={onClose}>✕</button>
            <h3>👤 {user.nickname}</h3>
            <p><strong>Nombre:</strong> {user.name} {user.lastName}</p>
            <p><strong>Nacimiento:</strong> {new Date(user.birthDate).toLocaleDateString()}</p>
            <p><strong>Stack:</strong> 💰 {user.stack}</p>
            <p><strong>Victorias:</strong> 🏆 {user.wins}</p>
            <p><strong>Partidas:</strong> 🎮 {user.totalGames}</p>

            <hr />
            <ul className="menu-list">
                <li>⚙️ Perfil</li>
                <li>📊 Estadísticas</li>
                <li>🚪 Cerrar sesión</li>
            </ul>
        </div>
    );
}
