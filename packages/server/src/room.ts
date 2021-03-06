import { PlayerInfo, RoomState, RoundState, sleep } from "@ai-goes-to-ny/shared";
import { Socket } from "socket.io";
import { Round } from "./round";
import { GameServer, GameSocket } from "./utils";

export class Room {
    private players = new Set<GameSocket>();
    private roomState: RoomState = RoomState.Lobby;

    constructor(private server: GameServer, private name: string, private closeRoom: () => void) {}

    public addPlayer = (player: GameSocket) => {
        this.players.add(player);
        player.join(this.name);

        player.on("startGame", () => this.startGame());
        player.on("disconnecting", () => this.removePlayer(player))

        player.emit("roomStateUpdate", this.roomState);
        this.synchronizePlayerInfo();
    };

    public removePlayer = (player: Socket) => {
        this.players.delete(player);
        player.leave(this.name);

        if (this.players.size === 0) {
            this.closeRoom();
        }

        this.synchronizePlayerInfo();
    };

    private startGame = async () => {
        if (this.roomState !== RoomState.Lobby) { return; }

        const updateRoundState = (roundState: RoundState) => {
            this.server.to(this.name).emit("roundStateUpdate", roundState);
        };

        this.changeRoomState(RoomState.Game);

        const round = new Round(updateRoundState);
        await round.initialize();

        const turns = round.generateTurns(this.players);
        const usedAvatars = turns.map(turn => turn.avatar);

        for (const turn of turns) {
            await round.playTurn(turn);
        }

        this.changeRoomState(RoomState.Guesses);
        await sleep(1000);
        await round.inquireGuesses(usedAvatars);

        this.synchronizePlayerInfo();
        this.changeRoomState(RoomState.Lobby);
    };

    private synchronizePlayerInfo = () => {
        const infos = [...this.players.values()].map(player => {
            return {
                name: player.data.name,
                points: player.data.points,
            } as PlayerInfo;
        });
        this.server.to(this.name).emit("playerListUpdate", infos);
    };

    private changeRoomState = (newState: RoomState) => {
        this.roomState = newState;
        this.server.to(this.name).emit("roomStateUpdate", this.roomState);
    }
};