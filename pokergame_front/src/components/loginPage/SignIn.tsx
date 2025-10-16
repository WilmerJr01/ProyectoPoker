import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import hidepass from "../../assets/hidepass.svg";
import viewpass from "../../assets/viewpass.svg";

export default function SignUp() {
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [nickname, setNickname] = useState<string>("");

    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const port = import.meta.env.VITE_PORT_AUTH;
            console.log(port);
            const memory= await axios.post(`${port}/auth/login`, {
                nickname,
                password
            });
            localStorage.setItem("token", memory.data.token);
            localStorage.setItem("userId", memory.data.userId);
            navigate("/home");
        } catch (err) {
            console.error(err);
            alert("Credenciales incorrectas");
        }
    };

    return (
        <div className="right_panel">
            <h2>Sign In</h2>
            <div className="login_form">
                <input
                    type="text"
                    placeholder="Nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                />
                {/* Password con botón afuera */}
                <div className="password_row">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        className="icon_button_outside"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        <img
                            src={showPassword ? hidepass : viewpass}
                            alt={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            className="icon_img"
                        />
                    </button>
                </div>
                
                <button className="sendBtn" onClick={handleLogin}>Entry</button>
            </div>
        </div>
    )
}