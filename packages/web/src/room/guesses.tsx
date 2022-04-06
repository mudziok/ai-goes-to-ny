import { Avatar } from "@ai-goes-to-ny/shared/dist/avatar";
import { FC, useContext, useEffect, useState } from "react"
import { SocketContext } from "../context/socket";
import { Choice } from "./choice";

export const Guesses:FC = () => {
    const socket = useContext(SocketContext);

    const [choices, setChoices] = useState<Avatar[]>([]);
    const [sendGuess, setSendGuess] = useState<(avatar: Avatar) => void>(() => () => {});
    const [chosenAvatar, setChosenAvatar] = useState<Avatar | null>(null);
    const [canVote, setCanVote] = useState<boolean>(false);

    useEffect(() => {
        socket.on("requestGuess", (avatars: Avatar[], callback: (avatar: Avatar) => void) => {
            setChoices(avatars);
            setSendGuess(() => callback);
            setCanVote(true);
        });

        return () => { socket.off("requestGuess"); }
    });

    const onChoose = (avatar: Avatar) => {
        if (canVote) {
            setChosenAvatar(avatar);
            setCanVote(false);
            sendGuess(avatar);
        }
    }

    return (
        <div className="text-center w-full px-4">
            <h3 className="text-xl p-2">Who was the AI player?</h3>
            {choices.map((choice, i) => <Choice key={i} avatar={choice} onChoose={onChoose} active={canVote} chosen={chosenAvatar === choice}/>)}
        </div>
    )
}