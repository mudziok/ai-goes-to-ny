import { ClientToServerEvents,  ServerToClientEvents, SocketData } from "@ai-goes-to-ny/shared";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Room } from "./room";

export type GameServer = Server<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, SocketData>
export type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>

const rooms = new Map<String, Room>();

const closeRoom = (name: string) => {
    rooms.delete(name);
}

const main = async () => {

    const server: GameServer = new Server<ClientToServerEvents, ServerToClientEvents, DefaultEventsMap, SocketData>(8000, {
        cors: {
            origin: '*'
        }
    });

    server.on("connection", (socket) => {
        socket.on("joinRoom", (nickname, roomName, callback) => {
            socket.data.name = nickname;
            socket.data.points = 0;

            const createRoom = (name: string): Room => {
                const closeCallback = () => closeRoom(name);
                const newRoom = new Room(server, roomName, closeCallback);
                rooms.set(name, newRoom);
                return newRoom;
            }

            const room = rooms.has(roomName) ? rooms.get(roomName)! : createRoom(roomName);
            room.addPlayer(socket);

            callback(true);
        });
    });
}

main();