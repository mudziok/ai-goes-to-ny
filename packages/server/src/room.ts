import { PlayerInfo, RoomState, RoundState, sleep } from "@ai-goes-to-ny/shared";
import { Socket } from "socket.io";
import { GameServer, GameSocket } from ".";
import { Round } from "./round";

export class Room {
    private players = new Set<GameSocket>();
    private roomState: RoomState = RoomState.Lobby;

    constructor(private server: GameServer, private name: string, private closeServer: () => void) {}

    public addPlayer = (player: GameSocket) => {
        console.log(`${player.data.name!} joined room ${this.name}`)

        this.players.add(player);
        player.join(this.name);

        player.on("startGame", () => this.startGame());
        player.on("disconnecting", () => this.removePlayer(player))

        player.emit("roomStateUpdate", this.roomState);
        this.synchronizePlayerInfo();
    };

    public removePlayer = (player: Socket) => {
        console.log(`${player.data.name!} exited room ${this.name}`)

        this.players.delete(player);
        player.leave(this.name);

        if (this.players.size === 0) {
            this.closeServer();
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

        const [turns, decoder] = round.generateTurns(this.players);
        const usedAvatars = turns.map(turn => turn.avatar);
        await round.startGame(turns);

        this.changeRoomState(RoomState.Guesses);
        await sleep(1000);
        await round.inquireGuesses(usedAvatars, decoder);

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