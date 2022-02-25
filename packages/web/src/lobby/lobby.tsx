import { PlayerInfo } from "@ai-goes-to-ny/shared";
import { FC } from "react"
import { PlayerSummary } from "./playerSummary";

interface LobbyProps {
    players: PlayerInfo[],
    onStart: () => void,
}

export const Lobby:FC<LobbyProps> = ({players, onStart}) => {
    return (
        <div className="h-full w-full relative">
            <div className="flex flex-wrap justify-center">
                {players.map((player, i) => <PlayerSummary key={i} playerInfo={player}/>)}
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                <input className="w-fit font-bold cursor-pointer text-white bg-primary-600 px-8 py-4 m-2 rounded-full" type="button" value="Start" onClick={onStart}/>
            </div>
        </div>
    );
};