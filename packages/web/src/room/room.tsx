import { PlayerInfo, RoomState } from "@ai-goes-to-ny/shared";
import { useContext, useState } from "react";
import { SocketContext } from "../context/socket";
import { Lobby } from "../lobby/lobby";
import { Game } from "./game";
import { Guesses } from "./guesses";
import { JoinRoomDialog } from "./joinRoomDialog";

export const Room = () => {
    const socket = useContext(SocketContext);

    const [roomState, setRoomState] = useState<RoomState>(RoomState.Login);
    const [players, setPlayers] = useState<PlayerInfo[]>([]);

    const joinRoom = (nickname: string, room: string) => {
        const onJoinRoomCallback = (success: boolean) => console.log(`Room ${room} join ${success ? "success" : "fail"}`);
        
        socket.on("playerListUpdate", players => setPlayers(players));
        socket.on("roomStateUpdate", roomState => setRoomState(roomState));

        socket.emit("joinRoom", nickname, room, onJoinRoomCallback);
    }

    const startGame = () => socket.emit("startGame");

    return (
        <div className="w-full h-full">
            { roomState === RoomState.Login &&
                <div className="w-full h-full flex justify-center items-center">
                    <JoinRoomDialog onJoinRequest={joinRoom}/>
                </div>
            }
            { roomState === RoomState.Lobby &&
                <Lobby players={players} onStart={startGame}/>
            }
            { (roomState === RoomState.Game || roomState === RoomState.Guesses) &&
                <div className="w-full h-full">
                    <Game />
                    { roomState === RoomState.Guesses && 
                        <Guesses />
                    }
                </div>
            }
        </div>
    );
};