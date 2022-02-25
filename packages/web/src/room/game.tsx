import { Point, Stroke } from "@ai-goes-to-ny/shared";
import { Avatar } from "@ai-goes-to-ny/shared/dist/avatar";
import { FC, useContext, useEffect, useState } from "react";
import { Canvas } from "../canvas/canvas";
import { SocketContext } from "../context/socket";
import { Ribbon } from "./ribbon";

const doNothing = () => {}

export const Game:FC = () => {
    const socket = useContext(SocketContext);
    const [sendLine, setSendLine] = useState<(line: Point[]) => void>(() => doNothing);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [currentlyDrawing, setCurrentlyDrawing] = useState<Avatar | undefined>();
    const [isActive, setIsActive] = useState<boolean>(false);

    useEffect(() => {
        socket.on("requestLine", (callback: (line: Point[]) => void) => {
            setSendLine(() => callback);
            setIsActive(true);
        }); 
        // @ts-ignore
        socket.on("roundStateUpdate", ({currentlyDrawing, strokes, theme}) => {
            setStrokes(strokes);
            setCurrentlyDrawing(currentlyDrawing);
        });
    });

    const onLineFinished = (line: Point[]) => {
        sendLine(line);
        setSendLine(doNothing);
        setIsActive(false);
    };

    return (
        <div className="w-full h-full">
            { currentlyDrawing !== undefined &&
                <Ribbon currentlyDrawing={currentlyDrawing} theme="a Cat" isActive={isActive}/>
            }
            <div className="w-full flex justify-center">
                <Canvas strokes={strokes} onLineFinished={onLineFinished} />
            </div>
        </div>
    );
};