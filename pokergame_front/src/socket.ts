import { io, Socket } from "socket.io-client";

export const createSocket = (): Socket => {
  const port = import.meta.env.VITE_PORT_BACK;
  console.log(port);
  return io(`http://localhost:${port}`);      
};
