// pages/LoginPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginPage() {
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const res = await axios.post(`http://localhost:${import.meta.env.PORT_AUTH}}/login`, { nickname, password });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("userId", res.data.userId);
            navigate("/home"); // redirige al home
        } catch (err) {
            console.error(err);
            alert("Credenciales incorrectas");
        }
    };

    return (
        <div>
            <h1>Login</h1>
            <input placeholder="Nickname" value={nickname} onChange={e => setNickname(e.target.value)} />
            <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}
