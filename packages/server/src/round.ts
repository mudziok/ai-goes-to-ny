import { Point, RoundState, sleep, Stroke } from "@ai-goes-to-ny/shared";
import { Avatar, avatars } from "@ai-goes-to-ny/shared/dist/avatar";
import { Socket } from "socket.io";
import { AI } from "./ai";
import { GameSocket } from "./utils";

interface Turn {
    avatar: Avatar,
    requestLine: () => Promise<Stroke[]>,
}

export class Round {
    private ai = new AI;    
    private strokes: Stroke[] = [];

    constructor(private updateRoundState: (roundState: RoundState) => void) {};

    public initialize = async () => {
        await this.ai.initialize();
    }

    public playTurn = async (turn: Turn) => {
        const roundState: RoundState = {
            theme: "cat",
            strokes: this.strokes,
            currentlyDrawing: turn.avatar,
        };
        this.updateRoundState(roundState);

        const playerLine = turn.requestLine();

        const timeoutLine = new Promise<Stroke[]>(async resolve => {
            await sleep(10000);
            resolve([]);
        });

        const newStroke: Stroke[] = await Promise.any([playerLine, timeoutLine]);

        this.strokes = [...this.strokes, ...newStroke];
        
        roundState.strokes = this.strokes;
        this.updateRoundState(roundState);
    }

    public inquireGuesses = async (usedAvatars: Avatar[], decoder: Map<string, GameSocket>) => {

        const players = [...decoder.values()];

        const getPlayerRequestGuess = (player: GameSocket) => new Promise<Avatar>(resolve => {
            const usedAvatarsWithoutPlayer = usedAvatars.filter(avatar => decoder.get(avatar.name) !== player);
            player.emit("requestGuess", usedAvatarsWithoutPlayer, (avatar: Avatar) => {
                resolve(avatar);
            });
        });

        const requests = players.map(player => getPlayerRequestGuess(player));

        const winningAvatars = await Promise.all(requests);

        winningAvatars.forEach(avatar => {
            if (decoder.has(avatar.name)) {
                const player = decoder.get(avatar.name)!;
                player.data.points += 1;
            }
        })
    }

    public generateTurns = (players: Set<Socket>): [Turn[], Map<string, GameSocket>] => {
        const getPlayerRequestLine = (player: GameSocket) => new Promise<Stroke[]>(resolve => {
            player.emit("requestLine", (line: Point[]) => {
                const movedLine = line.map(([x, y]) => [x - 150, y - 150] as Point);
                const strokes = this.ai.lineToStroke(movedLine, this.strokes);
                resolve(strokes);
            });
        });

        const aiRequestLine: () => Promise<Stroke[]> = () => new Promise<Stroke[]>(async resolve => {
            if (this.strokes.length > 0) {
                this.ai.initRNNStateFromStrokes(this.strokes);
            }
            const newStroke = this.ai.generateLine();

            await sleep(1000);
            resolve(newStroke); 
        });

        const avaliableAvatars: Avatar[] = Object.values(avatars);
        avaliableAvatars.sort(() => Math.random() - 0.5);
        
        const decoder = new Map<string, GameSocket>();

        const playerTurns: Turn[] = [...players.values()].map(player => {

            const randomAvatar = avaliableAvatars.pop()!;
            decoder.set(randomAvatar.name, player);

            return {
                avatar: randomAvatar,
                requestLine: () => getPlayerRequestLine(player),
            };
        });

        const aiTurn: Turn = {
            avatar: avaliableAvatars.pop()!,
            requestLine: aiRequestLine,
        };

        const turns = [...playerTurns, aiTurn];
        turns.sort(() => Math.random() - 0.5);

        return [turns, decoder];
    }
};