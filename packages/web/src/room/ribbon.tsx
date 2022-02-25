import { Avatar } from "@ai-goes-to-ny/shared/dist/avatar"
import { FC } from "react"

interface RibbonProps {
    currentlyDrawing: Avatar,
    theme: string,
    isActive: boolean,
}

export const Ribbon:FC<RibbonProps> = ({currentlyDrawing, theme, isActive}) => {
    const ribbonStyle = {backgroundColor: currentlyDrawing.color};

    return (
        <div style={ribbonStyle} className={`p-2 flex flex-col items-center justify-center h-32`}>
            <h3 className="text-5xl m-2">{currentlyDrawing.name}{isActive ? " (You)" : ""}</h3>
            <span className="text-lg font-semibold">is currently drawing {theme}</span>
        </div>
    )
}