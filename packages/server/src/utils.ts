import { ClientToServerEvents,  ServerToClientEvents, SocketData } from "@ai-goes-to-ny/shared";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export type GameServer = Server<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, SocketData>
export type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>

export const createServer = (port: number = 8000): GameServer => 
    new Server<
        ClientToServerEvents, 
        ServerToClientEvents, 
        DefaultEventsMap, 
        SocketData>
        (port, {cors: {origin: '*'}
});