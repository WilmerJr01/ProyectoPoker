import DatePicker from "react-datepicker";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import hidepass from "../../assets/hidepass.svg";
import viewpass from "../../assets/viewpass.svg";

export default function SignUp() {
    const [name, setName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [nickname, setNickname] = useState<string>("");
    const [birthdate, setBirthdate] = useState<Date | null>(null);

    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const port = import.meta.env.VITE_PORT_AUTH;
            const date = birthdate ? `${birthdate.getDate()}-${birthdate.getMonth() + 1}-${birthdate.getFullYear()}` : " "
            console.log(date)
            const memory = await axios.post(`http://localhost:${port}/auth/register`, {
                name,
                lastName,
                birthDate: date,
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
            <h2>Sign Up</h2>
            <div className="login_form">
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
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
                {/* DatePicker */}
                <DatePicker
                    selected={birthdate}
                    onChange={(date: Date | null) => setBirthdate(date)}
                    withPortal
                    placeholderText="Select your birthdate"
                    dateFormat="dd/MM/yyyy"
                    className="date_input"
                    showYearDropdown
                    scrollableYearDropdown
                    maxDate={new Date()}
                    popperPlacement="bottom"
                    portalId="root"
                />
                <button className="sendBtn" onClick={handleLogin}>Register</button>
            </div>
        </div>
    )
}