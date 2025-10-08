import "./lobbyCard.css"
import type { Lobby } from "../../types"
import tableIcon from "../../assets/tableIcon.png"
import financeIcon from "../../assets/financeIcon.svg"
import meetRoomIcon from "../../assets/meetRoomIcon.svg"
import { useNavigate } from "react-router-dom";

type LobbyCardProps = { lobby: Lobby };

export default function LobbyCard({ lobby }: LobbyCardProps) {
    const navigate = useNavigate();

    const handleJoin = async () => {
        const tableData = {
            id: lobby._id,
            name: lobby.name,
            maxPlayers: lobby.maxPlayers,
            minBuyIn: lobby.minBuyIn,
            maxBuyIn: lobby.maxBuyIn,
            bigBlind: lobby.bigBlind,
            smallBlind: lobby.smallBlind,
            gamesPlayed: lobby.gamesPlayed
        }
        localStorage.setItem("tableData", JSON.stringify(tableData))
        navigate(`/table/${lobby._id}`);
    };

    return (
        <div className="body_Card">
            <div className="imgTable">
                <img src={tableIcon} alt="Table" />
                <h2>{lobby.players.length}</h2>
            </div>
            <div className="infoTable">
                <div className="nameTable">
                    <p>Name:</p>
                    <h2>{lobby.name}</h2>
                </div>
                <p>ID: {lobby._id}</p>
                <p>Max Players: {lobby.maxPlayers}</p>
                <div className="blindsTable">
                    <img src={financeIcon} alt="Blinds" />
                    <p>{lobby.bigBlind} / {lobby.smallBlind}</p>
                </div>
            </div>
            <div className="entryBtn">
                <button onClick={handleJoin}>Join <img src={meetRoomIcon} alt="Join" /></button>
            </div>
        </div>
    )

}