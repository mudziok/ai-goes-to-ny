import { ClientToServerEvents, ServerToClientEvents } from "@ai-goes-to-ny/shared";
import { createContext } from "react";
import { io, Socket } from "socket.io-client";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('http://localhost:8000');
export const SocketContext = createContext(socket);