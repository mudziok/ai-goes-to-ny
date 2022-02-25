import { ChangeEvent, FC, FormEvent, useState } from "react"

interface JoinRoomDialogProps {
    onJoinRequest: (nickname: string, room: string) => void,
}

export const JoinRoomDialog:FC<JoinRoomDialogProps> = ({onJoinRequest}) => {
    const [name, setName] = useState<string>("user");
    const [room, setRoom] = useState<string>("default");
    
    const onChangeName = (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        setName(event.target.value);
    };

    const onChangeRoom = (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        setRoom(event.target.value);
    };

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onJoinRequest(name, room);
    }

    return (
        <form 
            className="relative flex flex-col w-64 items-center"
            onSubmit={onSubmit}
        >
            <span className="font-bold m-2">Room you want to join:</span>
            <input className="bg-slate-100 px-4 py-2 m-2 rounded-full text-center" type="text" placeholder="Roomname" value={room} onChange={onChangeRoom}/>

            <span className="font-bold m-2">Your name:</span>
            <input className="bg-slate-100 px-4 py-2 m-2 rounded-full text-center" type="text" placeholder="Nickname" value={name} onChange={onChangeName}/>

            <button className="w-fit font-bold cursor-pointer text-primary-50 bg-primary-600 px-8 py-4 m-2 rounded-full hover:bg-primary-700 transition">
                Join room
            </button>
        </form>
    );
};