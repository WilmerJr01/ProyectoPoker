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

export type UserData = {
    name: string;
    lastName: string;
    nickname: string;
    birthDate: Date;
    stack: number;
    wins: number;
    totalGames: number;
};

export type Seat = {
    seatIndex: number;
    id: string;
    nickname: string;
    stack: number;
    isHero: boolean;
};

export type PokerTableProps = {
    seats: Seat[];
    pot: number;
    bets: Record<string, number>;
    chips: Record<string, number>;
    community: string[];
    cards: Record<string, string[]>;
    dealer: string;
};

export type tableData = {
    id: string;
    name: string;
    maxPlayers: number;
    minBuyIn: number;
    maxBuyIn: number;
    bigBlind: number;
    smallBlind: number;
    gamesPlayed: string[];
}

export interface LeaveAck {
    ok: boolean;
    error?: string;
    remainingPlayers?: string[];
}

export type ChatMessage = {
    _id: string;
    tableId: string;
    userId: string | null;
    nickname: string;
    text: string;
    isSystem?: boolean;
    createdAt: string;
};

export type ActionPayload =
    | { tableId: string; jugador: string; action: "fold" }
    | { tableId: string; jugador: string; action: "check" }
    | { tableId: string; jugador: string; action: "limp" }
    | { tableId: string; jugador: string; action: "raise"; amount: number };
