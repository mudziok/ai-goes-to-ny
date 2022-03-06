import { RoomState } from "@ai-goes-to-ny/shared";
import { Room } from "./room";
import { Round } from "./round";
import { ClientSocket, createTestServer } from "./testUtils";
import { GameServer, GameSocket } from "./utils";

describe("Round", () => {
    let server: GameServer;
    let players: GameSocket[] = [];
    let clients: ClientSocket[] = [];

    beforeAll(async () => {
        [server, players, clients] = await createTestServer(2);
    });
    
    afterAll(async () => {
        server.close();
        clients.forEach(client => client.close());
    });
    
    let room: Room;
    
    beforeEach(async () => {
        room = new Room(server, "Test Room", () => {});
    })

    it("should inform all players about new player joining and disconnecting", async () => {
        const firstClientCallback = jest.fn();
        const secondClientCallback = jest.fn();

        clients[0].on("playerListUpdate", firstClientCallback);
        clients[1].on("playerListUpdate", secondClientCallback);
        
        room.addPlayer(players[0]);
        room.addPlayer(players[1]);

        await new Promise(resolve => setTimeout(resolve, 100));

        const expectedCallback = [
            {name: "Player 1", points: 0},
            {name: "Player 2", points: 0},
        ]

        expect(firstClientCallback).lastCalledWith(expectedCallback);
        expect(secondClientCallback).lastCalledWith(expectedCallback);
        
        expect(firstClientCallback).toBeCalledTimes(2);
        expect(secondClientCallback).toBeCalledTimes(1);

        room.removePlayer(players[1]);

        await new Promise(resolve => setTimeout(resolve, 100));

        expect(firstClientCallback).lastCalledWith([{name: "Player 1", points: 0}]);

        clients.forEach(client => client.off("playerListUpdate"))
    });

    it("should inform player about round state", async () => {
        jest.spyOn(Round.prototype, "initialize").mockImplementation(async () => {});
        jest.spyOn(Round.prototype, "playTurn").mockImplementation(async () => {});
        jest.spyOn(Round.prototype, "inquireGuesses").mockImplementation(async () => {});

        room.addPlayer(players[1]);

        await new Promise(resolve => setTimeout(resolve, 100));

        const roomStateUpdate = jest.fn();
        clients[0].on("roomStateUpdate", roomStateUpdate);
        clients[0].emit("startGame");

        await new Promise(resolve => setTimeout(resolve, 2000));

        expect(roomStateUpdate).toBeCalledTimes(3);
        expect(roomStateUpdate.mock.calls[0][0]).toEqual(RoomState.Game);
        expect(roomStateUpdate.mock.calls[1][0]).toEqual(RoomState.Guesses);
        expect(roomStateUpdate.mock.calls[2][0]).toEqual(RoomState.Lobby);
    });
});