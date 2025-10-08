import { useEffect, useState } from 'react';
import './optionBar.css';
import axios from 'axios';
import menu_icon from "../../assets/menu_icon.svg";
import MenuInfo from '../menuInfo/menuInfo';
import ficha_icon from "../../assets/ficha.svg"
import type { UserData } from "../../types"

export default function OptionBar() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        const port = import.meta.env.VITE_PORT_AUTH;
        const userId = localStorage.getItem("userId");
        if (!userId || !port) return;

        axios.get(`http://localhost:${port}/auth/user/${userId}`)
            .then((res) => {
                setUserData(res.data);
                localStorage.setItem("userData", JSON.stringify(res.data))
            })
            .catch((err) => console.error("Error al obtener usuario:", err));
    }, []);

    useEffect(() => {
        document.body.style.overflow = showMenu ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [showMenu]);

    return (
        <>
            <div className="option-bar">
                <h2>PokerFace</h2>

                <div className="user_info">
                    <div className="txtMenu">
                        <h1 className="name">Hi, {userData?.name ?? '...'}</h1>
                        <div className="stack">
                            <img src={ficha_icon} alt="Stack: " />
                            <p> {userData?.stack ?? '—'}</p>
                        </div>
                    </div>

                    <button className="btnMenu" onClick={() => setShowMenu(true)}>
                        <img src={menu_icon} alt="Menu" />
                    </button>
                </div>
            </div>

            {/* Backdrop + Drawer */}
            {showMenu && (
                <div
                    className="drawer-backdrop"
                    onClick={() => setShowMenu(false)}
                >
                    {/* stopPropagation para no cerrar al hacer click dentro del panel */}
                    <div
                        className="drawer-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Información de usuario y menú"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {userData && (
                            <MenuInfo user={userData} onClose={() => setShowMenu(false)}
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
