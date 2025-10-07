import "./lobbyCard.css"
import type { Lobby } from "../../types"
import tableIcon from "../../assets/tableIcon.png"
import financeIcon from "../../assets/financeIcon.svg"
import meetRoomIcon from "../../assets/meetRoomIcon.svg"

type LobbyCardProps = { lobby: Lobby };

export default function LobbyCard({ lobby }: LobbyCardProps) {

    return (
        <div className="body_Card">
            <div className="imgTable">
                <img src={tableIcon} alt="Table" />
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
                <button>Join <img src={meetRoomIcon} alt="Join" /></button>
            </div>
        </div>
    )

}