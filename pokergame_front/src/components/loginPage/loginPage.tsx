import { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import "./styles/loginPage.css";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import switchIcon from "../../assets/icon_switch.svg";

export default function LoginPage() {
    const [process, setProcess] = useState<boolean>(false);
    const [showBoth, setShowBoth] = useState<boolean>(false);
    const [visible, setVisible] = useState<boolean>(true);

    const handleSwitch = () => {
        setProcess((prev) => !prev);      // Cambia el texto del botón enseguida
        setShowBoth(true);
        setTimeout(() => {
            setShowBoth(false);
        }, 500); // Duración de la animación
    };

    return (
        <div className="conteiner_loginPage">
            <div className="conteiner_box">
                {/* Panel izquierdo */}
                <div className="left_panel">
                    <h1>PokerFace</h1>
                </div>
                {/* Panel derecho */}
                <div className="container_right_panel">
                    <div className="animation_container">
                        {/* Ambos componentes se renderizan durante la animación */}
                        <div className={`panel_anim ${!process ? "in" : showBoth ? "out" : ""}`}>
                            <SignIn />
                        </div>
                        <div className={`panel_anim ${process ? "in" : showBoth ? "out" : ""}`}>
                            <SignUp />
                        </div>
                    </div>
                    <div className="switch_process">
                        <p className={`switch_label ${visible ? "show" : "hide"}`}>{process ? "Sign In" : "Sign Up"}</p>
                        <button className="icon_switch" onClick={handleSwitch} onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}><img src={switchIcon} alt={process ? "Sign In" : "Sign Up"} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}