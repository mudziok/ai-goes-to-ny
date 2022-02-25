import Sketch from 'react-p5'
import p5Types from 'p5'
import { FC, useState } from 'react';
import { Point, Stroke } from '@ai-goes-to-ny/shared'

interface CanvasProps {
    strokes: Stroke[],
    onLineFinished: (line: Point[]) => void,
}

export const Canvas:FC<CanvasProps> = ({onLineFinished, strokes}) => {
    const [newLine, setNewLine] = useState<Point[]>([]);

    const mouseDragged = (p5: p5Types) => {
        const newPoint = [p5.mouseX, p5.mouseY] as Point;
        setNewLine(line => [...line, newPoint]);
    };

    const mouseReleased = (_p5: p5Types) => {
        onLineFinished(newLine);
        setNewLine([]);
    }

    const setup = (p5: p5Types, parentRef: Element) => {
        p5.createCanvas(600, 600).parent(parentRef);
        p5.frameRate(60);
    };

    const draw = (p5: p5Types) => {
        p5.background(255);
        p5.strokeWeight(10);
        p5.stroke(0,0,0);
        
        let draw = 0;
        let [x, y] = [150.0, 150.0];
        strokes.forEach(stroke => {
            const [dx, dy, newDraw, ..._] = stroke;
            if (draw) {
                p5.line(x, y, x + dx, y + dy);
            }
            x += dx;
            y += dy;
            draw = newDraw;
        });

        p5.stroke(255,0,0);
        newLine.forEach((p, i) => {
            if (i + 1 < newLine.length) {
                const start = p;
                const end = newLine[i + 1];
                p5.line(...start, ...end);
            }
        })
    };

    return (
        <div className='border-8 w-fit'>
            <Sketch setup={setup} draw={draw} mouseDragged={mouseDragged} mouseReleased={mouseReleased}/>
        </div>
    )
}