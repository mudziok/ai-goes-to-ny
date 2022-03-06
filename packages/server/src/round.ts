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
    private avaliableAvatars: Avatar[] = Object.values(avatars);
    private decoder = new Map<string, GameSocket>();

    constructor(private updateRoundState: (roundState: RoundState) => void) {
        this.avaliableAvatars.sort(() => Math.random() - 0.5);
    };

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

        try {
            const newStroke: Stroke[] = await playerLine;
            this.strokes = [...this.strokes, ...newStroke];
        } catch (error) {}
        
        const updatedRoundState = {...roundState};
        updatedRoundState.strokes = this.strokes;

        this.updateRoundState(updatedRoundState);
    }

    public inquireGuesses = async (usedAvatars: Avatar[]) => {
        const players = [...this.decoder.values()];

        const getPlayerRequestGuess = (player: GameSocket) => new Promise<Avatar>(resolve => {
            const usedAvatarsWithoutPlayer = usedAvatars.filter(avatar => this.decoder.get(avatar.name) !== player);
            player.emit("requestGuess", usedAvatarsWithoutPlayer, (avatar: Avatar) => {
                resolve(avatar);
            });
        });

        const requests = players.map(player => getPlayerRequestGuess(player));

        const winningAvatars = await Promise.all(requests);

        winningAvatars.forEach(avatar => {
            if (this.decoder.has(avatar.name)) {
                const player = this.decoder.get(avatar.name)!;
                player.data.points += 1;
            }
        })
    }

    public generateTurns = (players: Set<Socket>): Turn[] => {
        const playerTurns: Turn[] = [...players.values()].map(this.generatePlayerTurn);
        const aiTurn = this.generateAiTurn();

        const turns = [...playerTurns, aiTurn];
        turns.sort(() => Math.random() - 0.5);

        return turns;
    }

    public generatePlayerTurn = (player: Socket): Turn => {
        const getPlayerRequestLine = (player: GameSocket) => new Promise<Stroke[]>((resolve, reject) => {
            const timeout = setTimeout(reject, 10000);

            player.emit("requestLine", (line: Point[]) => {
                const movedLine = line.map(([x, y]) => [x - 150, y - 150] as Point);
                const strokes = this.ai.lineToStroke(movedLine, this.strokes);
                clearTimeout(timeout);
                resolve(strokes);
            });
        });

        const randomAvatar = this.avaliableAvatars.pop()!;
        this.decoder.set(randomAvatar.name, player);

        return {
            avatar: randomAvatar,
            requestLine: () => getPlayerRequestLine(player),
        };
    }

    public generateAiTurn = (): Turn => {
        const aiRequestLine: () => Promise<Stroke[]> = () => new Promise<Stroke[]>(async resolve => {
            if (this.strokes.length > 0) {
                this.ai.initRNNStateFromStrokes(this.strokes);
            }
            const newStroke = this.ai.generateLine();

            await sleep(1000);
            resolve(newStroke); 
        });

        return {
            avatar: this.avaliableAvatars.pop()!,
            requestLine: aiRequestLine,
        };
    }
};