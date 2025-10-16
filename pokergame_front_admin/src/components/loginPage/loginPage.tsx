import "react-datepicker/dist/react-datepicker.css";
import "./styles/loginPage.css";
import SignIn from "./SignIn";

export default function LoginPage() {

    return (
        <div className="conteiner_loginPage">
            <div className="conteiner_box">
                {/* Panel izquierdo */}
                <div className="left_panel">
                    <h1>Admin Page</h1>
                </div>
                {/* Panel derecho */}
                <div className="container_right_panel">
                    <div className="animation_container">
                            <SignIn />
                    </div>
                </div>
            </div>
        </div>
    );
}