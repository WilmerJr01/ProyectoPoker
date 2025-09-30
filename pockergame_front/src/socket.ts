import { io, Socket } from "socket.io-client";

export const createSocket = (): Socket => {
  return io(import.meta.env.PORT_BACK);      
};
