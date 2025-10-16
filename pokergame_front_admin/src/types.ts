export type Lobby = {
    _id: string,
    name: string,
    players: [],
    maxPlayers: number,
    minBuyIn: number,
    maxBuyIn: number,
    bigBlind: number,
    smallBlind: number,
    gamesPlayed: [],
    createdAt: string,
    updatedAt: string,
    __v: number
}

export type AdminData = {
    name: string;
    lastName: string;
    nickname: string;
    rol: string;
}

export type UserData = {
    name: string;
    lastName: string;
    nickname: string;
    birthDate: Date;
    stack: number;
    wins: number;
    totalGames: number;
};