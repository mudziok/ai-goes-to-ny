import { Stroke } from "@ai-goes-to-ny/shared"
import { useRef, useState } from "react"

export const useStrokes = (initialStrokes: Stroke[]): [Stroke[], (newStrokes: Stroke[]) => void] => {
    const [visibleStrokes, setVisibleStrokes] = useState<Stroke[]>(initialStrokes);
    const intervalRef = useRef<NodeJS.Timer>();

    const interpolateTo = (newStrokes: Stroke[]) => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            setVisibleStrokes(oldStrokes => {
                if (oldStrokes.length === newStrokes.length) {
                    clearInterval(intervalRef.current!);
                }
                return newStrokes.slice(0, oldStrokes.length + 1);
            });
        }, 50);
    };

    return [visibleStrokes, interpolateTo];
}