import { Point } from "@ai-goes-to-ny/shared";
import { Avatar } from "@ai-goes-to-ny/shared/dist/avatar";
import { FC, useContext, useEffect, useState } from "react";
import { Canvas } from "../canvas/canvas";
import { SocketContext } from "../context/socket";
import { Ribbon } from "./ribbon";
import { useStrokes } from "./useStrokes";

export const Game:FC = () => {
    const socket = useContext(SocketContext);

    const [sendLine, setSendLine] = useState<(line: Point[]) => void>(() => () => {});
    const [strokes, setStrokes] = useStrokes([]);
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

        return () => {
            socket.off("requestLine");
            socket.off("roundStateUpdate");
        }
    });

    const onLineFinished = (line: Point[]) => {
        if (isActive) {
            sendLine(line);
            setSendLine(() => {});
            setIsActive(false);
        }
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