import { Point } from '@ai-goes-to-ny/shared';
import { SketchRNN } from '@magenta/sketch'
import { LSTMState } from '@magenta/sketch/es5/sketch_rnn/model';

import fetch from 'node-fetch'

// @ts-ignore dirty hack to make RNN lib work in node
globalThis.fetch = fetch

// structure imposed by RNN lib, [dx, dy, penDown, penUp, penFinished]
type Stroke = number[];

export const createAI = async () => {
    const ai = new AI();
    await ai.initialize();
    return ai;
}

export class AI {
    private model: SketchRNN;
    private temperature: number = 0.25;
    private stroke: Stroke;
    private state: LSTMState;

    constructor() {
        this.model = new SketchRNN("https://storage.googleapis.com/quickdraw-models/sketchRNN/models/cat.gen.json");
        this.stroke = this.model.zeroInput();
        this.state = this.model.zeroState();
    };

    public initialize = async () => {
        await this.model.initialize();

        this.model.setPixelFactor(2.0);
        this.stroke = this.model.zeroInput();
        this.state = this.model.zeroState();
    };

    public generateLine = (): Stroke[] => {
        let strokes = [];
        do {
            this.stroke = this.sampleNewState();
            strokes.push(this.stroke);
        } while (this.stroke[3] !== 1 && this.stroke[4] !== 1);
        return strokes;
    };

    public initRNNStateFromStrokes = (strokes: Stroke[]): void => {
        let newState = this.model.zeroState();
        newState = this.model.update(this.model.zeroInput(), newState);
        newState = this.model.updateStrokes(strokes, newState, strokes.length - 1);

        this.state = this.model.copyState(newState);

        const lastStroke = strokes[strokes.length - 1]; 
        this.stroke = lastStroke;
    }

    private sampleNewState = (): Stroke => {
        this.state = this.model.update(this.stroke, this.state);
        const pdf = this.model.getPDF(this.state, this.temperature);

        return this.model.sample(pdf);
    };

    public lineToStroke = (line: Point[], allStrokes: Stroke[]): Stroke[] => {

        const endOfLastLine = allStrokes.reduce((acc, cur) => {
            return [acc[0] + cur[0], acc[1] + cur[1]];
        }, [0.0, 0.0])

        const simplifiedLine = this.model.simplifyLine(line);
        return this.model.lineToStroke(simplifiedLine, endOfLastLine);
    }
};