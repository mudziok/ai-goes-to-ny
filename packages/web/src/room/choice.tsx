import { Avatar } from "@ai-goes-to-ny/shared/dist/avatar";
import { FC, FormEvent } from "react";

interface ChoiceProps {
    avatar: Avatar,
    onChoose: (avatar: Avatar) => void
}

export const Choice:FC<ChoiceProps> = ({avatar, onChoose}) => {
    const choiceStyle = {backgroundColor: avatar.color};

    const onSubmit = (event: FormEvent<HTMLButtonElement>) => {
        event.preventDefault();
        onChoose(avatar);
    }

    return (
        <div style={choiceStyle} className="p-2 m-2 rounded-lg flex justify-between items-center">
            {avatar.name}
            <button className="p-2 bg-slate-100 m-2 rounded-lg" onClick={onSubmit} > Guess </button>
        </div>
    )
}