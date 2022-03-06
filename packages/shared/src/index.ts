import { Avatar } from "./avatar";

export type Stroke = number[];
export type Point = [number, number]

export interface ColorStroke {
    stroke: Stroke,
    author: Avatar,
}

export enum RoomState {
    Login,
    Lobby,
    Game,
    Guesses,
}

export interface PlayerInfo {
    name: string,
    points: number,
}

export interface RoundState {
    colorStrokes: ColorStroke[],
    currentlyDrawing: Avatar,
    theme: string,
}

export interface ServerToClientEvents {
    playerListUpdate: (players: PlayerInfo[]) => void,
    roomStateUpdate: (roomState: RoomState) => void,

    roundStateUpdate: (roundState: RoundState) => void,
    requestLine: (callback: (line: Point[]) => void) => void,
    requestGuess: (avatars: Avatar[], callback: (avatar: Avatar) => void) => void,
}

export interface ClientToServerEvents {
    joinRoom: (nickname: string, roomName: string, callback: (success: boolean) => void) => void,
    startGame: () => void,
}

export interface SocketData {
    name: string,
    points: number,
}

export const sleep = (ms: number = 2000) => new Promise<void>(resolve => setTimeout(resolve, ms));