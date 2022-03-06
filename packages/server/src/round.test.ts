import { Point, RoundState, Stroke } from "@ai-goes-to-ny/shared";
import { Avatar } from "@ai-goes-to-ny/shared/dist/avatar";
import { AI } from "./ai";
import { Round } from "./round";
import { ClientSocket, createTestServer } from "./testUtils";
import { GameServer, GameSocket } from "./utils";

const randomStrokes = (): Stroke[] => {
    const drawFlags = [[1,0,0], [1,0,0], [0,1,0]];
    const strokes: Stroke[] = drawFlags.map(flag => {
        const [x, y] = [Math.random() * 200, Math.random() * 200];
        return [x, y, ...flag];
    })
    return strokes;
};

describe("Round", () => {
    let server: GameServer;
    let players: GameSocket[] = [];
    let clients: ClientSocket[] = [];

    beforeAll(async () => {
        [server, players, clients] = await createTestServer(2);
    });
    
    afterAll(() => {
        server.close();
        clients.forEach(client => client.close());
    });
    
    let round: Round;
    let updateRoundState = jest.fn();
    
    beforeEach(async () => {
        jest.spyOn(AI.prototype, "initialize").mockImplementation(async () => {});
        jest.spyOn(AI.prototype, "generateLine").mockImplementation(randomStrokes);
        jest.spyOn(AI.prototype, "initRNNStateFromStrokes").mockReturnValue();

        round = new Round(updateRoundState);
        await round.initialize();
    })

    afterEach(() => {
        jest.useRealTimers();
    })

    it("should process AI turn", async () => {
        jest.useFakeTimers();
        const aiTurn = round.generateAiTurn();

        const playTurnPromise = round.playTurn(aiTurn);
        jest.advanceTimersByTime(2000);
        expect(await playTurnPromise).toBeUndefined();
        
        expect(updateRoundState).toBeCalledTimes(2);

        const newState: RoundState = updateRoundState.mock.calls[1][0];
        const {currentlyDrawing, strokes} = newState;

        expect(currentlyDrawing).toEqual(aiTurn.avatar);
        expect(strokes.length).toBeGreaterThan(0);
    });

    it("should process Player action", async () => {
        const playerTurn = round.generatePlayerTurn(players[0]);
        
        clients[0].on("requestLine", (callback: (line: Point[]) => void) => {
            callback([[0,0], [150, 150]]);
        }); 

        await round.playTurn(playerTurn);

        clients[0].off("requestLine");

        expect(updateRoundState).toBeCalledTimes(2);
    });

    it("should pass turn if a Player does nothing", async () => {
        jest.useFakeTimers();
        const playerTurn = round.generatePlayerTurn(players[0]);

        const playTurnPromise = round.playTurn(playerTurn);
        jest.runAllTimers();
        expect(await playTurnPromise).toBeUndefined();

        expect(updateRoundState).toBeCalledTimes(2);

        const newState: RoundState = updateRoundState.mock.calls[1][0];
        const {currentlyDrawing, strokes} = newState;

        expect(currentlyDrawing).toEqual(playerTurn.avatar);
        expect(strokes.length).toEqual(0);
    });

    it("should add points after voting", async () => {
        const winnerTurn = round.generatePlayerTurn(players[0]);
        const loserTurn = round.generatePlayerTurn(players[1]);
        const aiTurn = round.generateAiTurn();

        const turns = [winnerTurn, loserTurn, aiTurn];
        const usedAvatars = turns.map(turn => turn.avatar);

        clients[0].on("requestGuess", (avatars: Avatar[], callback: (avatar: Avatar) => void) => {
            expect(avatars).toContainEqual(aiTurn.avatar);
            expect(avatars).not.toContainEqual(winnerTurn.avatar);
            callback(aiTurn.avatar);
        });

        clients[1].on("requestGuess", (avatars: Avatar[], callback: (avatar: Avatar) => void) => {
            expect(avatars).toContainEqual(winnerTurn.avatar);
            expect(avatars).not.toContainEqual(loserTurn.avatar);
            callback(winnerTurn.avatar);
        });

        await round.inquireGuesses(usedAvatars);

        clients.forEach(client => client.off("requestGuess"));

        expect(players[0].data.points).toEqual(1);
        expect(players[1].data.points).toEqual(0);
    });

    it("should process all generated turns", async () => {
        const turns = round.generateTurns(new Set<GameSocket>(players));

        clients.forEach(client => client.on("requestLine", (callback: (line: Point[]) => void) => {
            callback([[0,0], [150, 150]]);
        }));

        for (const turn of turns) {
            await round.playTurn(turn);
        }

        clients.forEach(client => client.off("requestLine"));

        expect(updateRoundState).toBeCalledTimes(6);

        const newState: RoundState = updateRoundState.mock.calls[5][0];
        const {strokes} = newState;

        expect(strokes.length).toEqual(7);
    });
});