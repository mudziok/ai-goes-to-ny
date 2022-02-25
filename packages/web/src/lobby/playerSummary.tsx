import { PlayerInfo } from "@ai-goes-to-ny/shared"
import { FC } from "react"

interface PlayerSummaryProps {
    playerInfo: PlayerInfo,
}

export const PlayerSummary:FC<PlayerSummaryProps> = ({playerInfo}) => {
    const {name, points} = playerInfo;
    return (
        <div className="bg-slate-100 px-4 py-2 m-2 rounded shadow">
            {name} - Points: {points}
        </div>
    )
}