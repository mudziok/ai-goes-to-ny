import { Room } from "./room";
import { createServer, GameServer } from "./utils";

const rooms = new Map<String, Room>();

const closeRoom = (name: string) => {
    rooms.delete(name);
}

const main = async () => {

    const server: GameServer = createServer(8000);

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