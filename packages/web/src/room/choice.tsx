import { Avatar } from "@ai-goes-to-ny/shared/dist/avatar";
import { FC, FormEvent } from "react";

interface ChoiceProps {
    avatar: Avatar,
    onChoose: (avatar: Avatar) => void,
    active?: boolean,
    playerName?: string,
    chosen: boolean,
}

// @ts-ignore
export const Choice:FC<ChoiceProps> = ({avatar, onChoose, playerName, active = false, chosen}) => {
    const choiceStyle = {backgroundColor: avatar.color, "--tw-ring-color": avatar.color};

    const onSubmit = (event: FormEvent<HTMLButtonElement>) => {
        event.preventDefault();
        onChoose(avatar);
    }

    const emoji = avatar.name.slice(0,2).trim();;
    const avatarName = avatar.name.slice(2).trim();

    const nameStyle = playerName ? "translate-y-10" : "";
    const chosenStyle = chosen ? "ring-2 ring-offset-2" : "";
    const activeStyle = active ? "hover:brightness-95" : "";

    return (
        <button 
            style={choiceStyle}
            className={`${chosenStyle} ${activeStyle} my-2 rounded-lg flex items-center text-lg overflow-hidden w-full transition ease-out`}
            disabled={!active}
            onClick={onSubmit}
        >
            <div className="p-4">
                {emoji}
            </div>
            <div className={`relative transition-transform ${nameStyle}`}>
                {avatarName}
                <div className="absolute top-0 left-0 -translate-y-10">
                    {playerName}
                </div>
            </div>
        </button>
    )
}