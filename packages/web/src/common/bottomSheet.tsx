import { FC, MouseEvent, useRef, useState } from "react";

export const BottomSheet:FC = ({children}) => {
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const backgroundRef = useRef(null);

    const onBackgroundClick = (event: MouseEvent<HTMLElement>) => {
        if (event.target !== backgroundRef.current) return;
        setCollapsed(true);
    }

    const backgroundStyle = collapsed ? "bg-opacity-0" : "bg-opacity-60";
    const contentStyle = collapsed ? "h-0" : "h-96";

    return (
        <div 
            className={`fixed top-0 bottom-0 left-0 right-0 bg-black flex flex-col justify-end items-center z-10 ${backgroundStyle} transition-all`}
            onClick={onBackgroundClick}
            ref={backgroundRef}
        >
            <div className={`w-full sm:w-96 rounded-t-3xl overflow-hidden border flex flex-col items-center shadow-xl bg-white`}>
                <div className="cursor-pointer w-full flex justify-center" onClick={() => setCollapsed(collapsed => !collapsed)}>
                    <div className="w-20 h-2 bg-slate-300 rounded-full m-2"/>
                </div>
                <div className={`${contentStyle} transition-all w-full`}>
                    {children}
                </div>
            </div>
        </div>
    )
};