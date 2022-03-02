import { ClientToServerEvents, ServerToClientEvents } from "@ai-goes-to-ny/shared";
import { io, Socket } from "socket.io-client";
import { Round } from "./round";
import { createServer, GameServer, GameSocket } from "./utils";

describe("Round", () => {
    let server: GameServer;
    let player: GameSocket;
    // @ts-ignore
    let client: Socket<ServerToClientEvents, ClientToServerEvents>
    let round: Round;

    beforeAll(async () => {
        server = createServer(8000);
        server.on("connection", (socket) => {
            socket.data.name = "Test Name";
            socket.data.points = 0;

            player = socket;
        });
        round = new Round(()=>{});
        await round.initialize();
        client = io('http://localhost:8000');
    });

    afterAll(() => {
        server.close();
        client.close();
    });

    it("generates turns for one player and the ai", () => {
        const players = new Set<GameSocket>([player]);
        const [turns] = round.generateTurns(players);

        expect(turns.length).toBe(2);
    });
});