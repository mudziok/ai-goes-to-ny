import { Avatar } from "@ai-goes-to-ny/shared/dist/avatar";
import { FC, useContext, useEffect, useState } from "react"
import { SocketContext } from "../context/socket";
import { Choice } from "./choice";

export const Guesses:FC = () => {
    const socket = useContext(SocketContext);
    const [choices, setChoices] = useState<Avatar[]>([]);
    const [sendGuess, setSendGuess] = useState<(avatar: Avatar) => void>(() => () => {});

    useEffect(() => {
        socket.on("requestGuess", (avatars: Avatar[], callback: (avatar: Avatar) => void) => {
            setChoices(avatars);
            setSendGuess(() => callback);
        });
    });

    return (
        <div className="fixed left-0 right-0 top-0 bottom-0 bg-slate-600 bg-opacity-10 flex justify-center items-center">
            <div className="bg-white w-max p-4 rounded-3xl">
                Who was the AI player?
                {choices.map((choice, i) => <Choice key={i} avatar={choice} onChoose={sendGuess}/>)}
            </div>
        </div>
    )
}