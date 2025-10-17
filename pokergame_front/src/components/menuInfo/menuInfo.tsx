import './menuInfo.css';
import cancelBtn from "../../assets/cancelBtn.svg";
import userIcon from "../../assets/userIcon.svg";
import exitIcon from "../../assets/exitIcon.svg";
import { useNavigate } from "react-router-dom";
import winIcon from "../../assets/winIcon.svg";
import fichaIcon from "../../assets/ficha.svg"
import matchIcon from "../../assets/matchIcon.svg"



type UserData = {
    name: string;
    lastName: string;
    nickname: string;
    birthDate: Date;
    stack: number;
    wins: number;
    totalGames: number;
};

export default function MenuInfo({ user, onClose }: { user: UserData; onClose: () => void; }) {

    const navigate = useNavigate();

    const logOut = () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("token");
        navigate("/");
    }

    return (
        <div className="menu-info-content">
            <button className="close-drawer" onClick={onClose}><img src={cancelBtn} alt="Cancel" /></button>
            <div className='user'>
                <img src={userIcon} alt="User" />
                <h3>{user.nickname}</h3>
            </div>
            <p><strong>Name:</strong> {user.name} {user.lastName}</p>
            <p><strong>Stack:</strong> <img src={fichaIcon} />{user.stack}</p>
            <p><strong>Wins:</strong> <img src={winIcon} />{user.wins}</p>
            <p><strong>Games:</strong> <img src={matchIcon} /> {user.totalGames}</p>

            <hr />
            <button className='payBtn' onClick={()  => {navigate("/pay")}}> Top Up / Withdrawals</button>
            <button onClick={logOut} className='exitBtn'><img src={exitIcon} alt="Exit" /></button>

        </div>
    );
}
