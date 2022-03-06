import { ClientToServerEvents, ServerToClientEvents } from "@ai-goes-to-ny/shared";
import { createServer } from "http";
import { AddressInfo } from "net";
import { Server } from "socket.io";
import { io, Socket } from "socket.io-client";
import { GameServer, GameSocket } from "./utils";

export type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;
type TestServer = [GameServer, GameSocket[], ClientSocket[]];

export const createTestServer = async (desiredClients: number): Promise<TestServer> => {
    const players: GameSocket[] = [];
    const clients: ClientSocket[] = [];

    const httpServer = createServer();
    const server = new Server(httpServer);
    
    return new Promise<TestServer>(resolve => {
        httpServer.listen(() => {
            const port = (httpServer.address() as AddressInfo).port;

            clients.push(io(`http://localhost:${port}`));

            server.on("connection", socket => {
                socket.data.name = `Player ${players.length + 1}`
                socket.data.points = 0;
    
                players.push(socket);
                if (players.length == desiredClients) {
                    resolve([server, players, clients]);
                } else {
                    clients.push(io(`http://localhost:${port}`));
                }
            });
        });    
    });
}